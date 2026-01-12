import { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { withStoreContext } from '@/lib/api/handlers';
import { ok, created, badRequest, notFound, serverError, logRouteError } from '@/lib/api/responses';
import { logger } from '@/lib/api/logger';

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

// GET - List all categories
export async function GET(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await withStoreContext<{ storeId: string }>(request, slug);

	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;

	const { storeId } = ctx as { storeId: string };

	const rows = await db
		.select()
		.from(categories)
		.where(and(eq(categories.storeId, storeId), eq(categories.isActive, true)))
		.orderBy(categories.sortOrder);

	return ok(
		{ categories: rows },
		{
			headers: {
				'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
			},
		}
	);
}

// POST - Create category
export async function POST(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await withStoreContext<{ storeId: string }>(request, slug, undefined, { enforceOwner: true });

	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;

	const { storeId } = ctx as { storeId: string };

	try {
		const body = await request.json();
		const { name, description, image, color, sortOrder } = body;

		if (!name || typeof name !== 'string' || !name.trim()) {
			return badRequest('Category name is required');
		}

		// Generate slug from name
		const categorySlug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		const categoryId = createId();

		await db.insert(categories).values({
			id: categoryId,
			storeId,
			name: name.trim(),
			slug: categorySlug,
			description: description || null,
			image: image || null,
			color: color || '#3b82f6',
			sortOrder: sortOrder || 0,
			isActive: true,
		});

		const [newCategory] = await db
			.select()
			.from(categories)
			.where(eq(categories.id, categoryId));

		return created({ category: newCategory });
	} catch (error) {
		await logRouteError('Failed to create category', error, params, { storeId });
		return serverError('Failed to create category');
	}
}

// PUT - Update category
export async function PUT(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await withStoreContext<{ storeId: string }>(request, slug, undefined, { enforceOwner: true });

	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;

	const { storeId } = ctx as { storeId: string };

	try {
		const body = await request.json();
		const { id, name, description, image, color, sortOrder } = body;

		if (!id) {
			return badRequest('Category ID is required');
		}

		if (!name || typeof name !== 'string' || !name.trim()) {
			return badRequest('Category name is required');
		}

		// Verify category belongs to this store
		const [existing] = await db
			.select()
			.from(categories)
			.where(and(eq(categories.id, id), eq(categories.storeId, storeId)));

		if (!existing) {
			return notFound('Category not found');
		}

		await db
			.update(categories)
			.set({
				name: name.trim(),
				description: description || null,
				image: image || null,
				color: color || '#3b82f6',
				sortOrder: sortOrder || 0,
				updatedAt: new Date(),
			})
			.where(eq(categories.id, id));

		const [updatedCategory] = await db
			.select()
			.from(categories)
			.where(eq(categories.id, id));

		return ok({ category: updatedCategory });
	} catch (error) {
		await logRouteError('Failed to update category', error, params, { storeId });
		return serverError('Failed to update category');
	}
}

// DELETE - Delete category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await withStoreContext<{ storeId: string }>(request, slug, undefined, { enforceOwner: true });

	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;

	const { storeId } = ctx as { storeId: string };

	try {
		const url = new URL(request.url);
		const categoryId = url.searchParams.get('id');

		if (!categoryId) {
			return badRequest('Category ID is required');
		}

		// Verify category belongs to this store
		const [existing] = await db
			.select()
			.from(categories)
			.where(and(eq(categories.id, categoryId), eq(categories.storeId, storeId)));

		if (!existing) {
			return notFound('Category not found');
		}

		// Soft delete by setting isActive to false
		await db
			.update(categories)
			.set({ isActive: false, updatedAt: new Date() })
			.where(eq(categories.id, categoryId));

		return ok({ success: true });
	} catch (error) {
		await logRouteError('Failed to delete category', error, params, { storeId });
		return serverError('Failed to delete category');
	}
}

