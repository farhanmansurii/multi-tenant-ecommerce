import { NextResponse, type NextRequest } from 'next/server';
import { and, eq, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

import { db } from '@/lib/db';
import { discounts } from '@/lib/db/schema';
import { withStoreContext } from '@/lib/api/handlers';

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

	return NextResponse.json({ discounts: rows });
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
			return NextResponse.json({ error: 'Discount code is required' }, { status: 400 });
		}

		if (!value || value <= 0) {
			return NextResponse.json({ error: 'Discount value must be positive' }, { status: 400 });
		}

		if (type === 'percentage' && value > 100) {
			return NextResponse.json({ error: 'Percentage discount cannot exceed 100%' }, { status: 400 });
		}

		// Check if code already exists for this store
		const [existing] = await db
			.select()
			.from(discounts)
			.where(and(eq(discounts.storeId, storeId), eq(discounts.code, code.toUpperCase())));

		if (existing) {
			return NextResponse.json({ error: 'Discount code already exists' }, { status: 400 });
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

		return NextResponse.json({ discount: newDiscount }, { status: 201 });
	} catch (error) {
		console.error('Failed to create discount:', error);
		return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
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
			return NextResponse.json({ error: 'Discount ID is required' }, { status: 400 });
		}

		const [existing] = await db
			.select()
			.from(discounts)
			.where(and(eq(discounts.id, id), eq(discounts.storeId, storeId)));

		if (!existing) {
			return NextResponse.json({ error: 'Discount not found' }, { status: 404 });
		}

		const newType = updateData.type || existing.type;
		const newValue = updateData.value !== undefined ? updateData.value : existing.value;

		if (newType === 'percentage' && newValue > 100) {
			return NextResponse.json({ error: 'Percentage discount cannot exceed 100%' }, { status: 400 });
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

		return NextResponse.json({ discount: updated });
	} catch (error) {
		console.error('Failed to update discount:', error);
		return NextResponse.json({ error: 'Failed to update discount' }, { status: 500 });
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
			return NextResponse.json({ error: 'Discount ID is required' }, { status: 400 });
		}

		const [existing] = await db
			.select()
			.from(discounts)
			.where(and(eq(discounts.id, discountId), eq(discounts.storeId, storeId)));

		if (!existing) {
			return NextResponse.json({ error: 'Discount not found' }, { status: 404 });
		}

		await db.delete(discounts).where(eq(discounts.id, discountId));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Failed to delete discount:', error);
		return NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 });
	}
}
