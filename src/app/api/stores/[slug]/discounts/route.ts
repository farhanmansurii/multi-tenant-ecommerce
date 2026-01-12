import { NextRequest } from 'next/server';
import { and, eq, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

import { db } from '@/lib/db';
import { discounts } from '@/lib/db/schema';
import { withStoreContext } from '@/lib/api/handlers';
import { ok, created, badRequest, notFound, serverError, logRouteError } from '@/lib/api/responses';

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

// GET - List all discounts
export async function GET(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await withStoreContext<{ storeId: string }>(request, slug, undefined, { enforceOwner: true });
	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;
	const { storeId } = ctx as { storeId: string };

	const rows = await db
		.select()
		.from(discounts)
		.where(eq(discounts.storeId, storeId))
		.orderBy(desc(discounts.createdAt));

	return ok({ discounts: rows });
}

// POST - Create discount
export async function POST(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await withStoreContext<{ storeId: string }>(request, slug, undefined, { enforceOwner: true });
	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;
	const { storeId } = ctx as { storeId: string };

	try {
		const body = await request.json();
		const {
			code,
			type = 'percentage',
			value,
			minOrderAmount,
			maxDiscountAmount,
			usageLimit,
			usageLimitPerCustomer,
			startsAt,
			expiresAt,
			description,
			applicableTo,
		} = body;

		if (!code || typeof code !== 'string' || !code.trim()) {
			return badRequest('Discount code is required');
		}

		if (!value || value <= 0) {
			return badRequest('Discount value must be positive');
		}

		if (type === 'percentage' && value > 100) {
			return badRequest('Percentage discount cannot exceed 100%');
		}

		// Check if code already exists for this store
		const [existing] = await db
			.select()
			.from(discounts)
			.where(and(eq(discounts.storeId, storeId), eq(discounts.code, code.toUpperCase())));

		if (existing) {
			return badRequest('Discount code already exists');
		}

		const discountId = createId();

		await db.insert(discounts).values({
			id: discountId,
			storeId,
			code: code.toUpperCase().trim(),
			type,
			value,
			minOrderAmount: minOrderAmount || null,
			maxDiscountAmount: maxDiscountAmount || null,
			usageLimit: usageLimit || null,
			usageLimitPerCustomer: usageLimitPerCustomer || 1,
			startsAt: startsAt ? new Date(startsAt) : null,
			expiresAt: expiresAt ? new Date(expiresAt) : null,
			description: description || null,
			applicableTo: applicableTo || { type: 'all' },
			isActive: true,
		});

		const [newDiscount] = await db
			.select()
			.from(discounts)
			.where(eq(discounts.id, discountId));

		return created({ discount: newDiscount });
	} catch (error) {
		await logRouteError('Failed to create discount', error, params, { storeId });
		return serverError('Failed to create discount');
	}
}

// PUT - Update discount
export async function PUT(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await withStoreContext<{ storeId: string }>(request, slug, undefined, { enforceOwner: true });
	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;
	const { storeId } = ctx as { storeId: string };

	try {
		const body = await request.json();
		const { id, ...updateData } = body;

		if (!id) {
			return badRequest('Discount ID is required');
		}

		const [existing] = await db
			.select()
			.from(discounts)
			.where(and(eq(discounts.id, id), eq(discounts.storeId, storeId)));

		if (!existing) {
			return notFound('Discount not found');
		}

		const newType = updateData.type || existing.type;
		const newValue = updateData.value !== undefined ? updateData.value : existing.value;

		if (newType === 'percentage' && newValue > 100) {
			return badRequest('Percentage discount cannot exceed 100%');
		}

		await db
			.update(discounts)
			.set({
				...updateData,
				code: updateData.code?.toUpperCase().trim(),
				startsAt: updateData.startsAt ? new Date(updateData.startsAt) : existing.startsAt,
				expiresAt: updateData.expiresAt ? new Date(updateData.expiresAt) : existing.expiresAt,
				updatedAt: new Date(),
			})
			.where(eq(discounts.id, id));

		const [updated] = await db
			.select()
			.from(discounts)
			.where(eq(discounts.id, id));

		return ok({ discount: updated });
	} catch (error) {
		await logRouteError('Failed to update discount', error, params, { storeId });
		return serverError('Failed to update discount');
	}
}

// DELETE - Delete discount
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await withStoreContext<{ storeId: string }>(request, slug, undefined, { enforceOwner: true });
	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;
	const { storeId } = ctx as { storeId: string };

	try {
		const url = new URL(request.url);
		const discountId = url.searchParams.get('id');

		if (!discountId) {
			return badRequest('Discount ID is required');
		}

		const [existing] = await db
			.select()
			.from(discounts)
			.where(and(eq(discounts.id, discountId), eq(discounts.storeId, storeId)));

		if (!existing) {
			return notFound('Discount not found');
		}

		await db.delete(discounts).where(eq(discounts.id, discountId));

		return ok({ success: true });
	} catch (error) {
		await logRouteError('Failed to delete discount', error, params, { storeId });
		return serverError('Failed to delete discount');
	}
}
