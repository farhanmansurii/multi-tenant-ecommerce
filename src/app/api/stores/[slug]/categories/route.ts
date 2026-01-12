import { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { getApiContextOrNull, getApiContext } from '@/lib/api/context';
import { ok, created, badRequest, notFound, serverError, logRouteError } from '@/lib/api/responses';
import { CACHE_CONFIG } from '@/lib/api/cache-config';
import { revalidateCategoryCache } from '@/lib/api/cache-revalidation';

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

export const revalidate = 300;
export async function GET(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await getApiContextOrNull(request, slug);
	if (ctx instanceof Response) return ctx;
	if (!ctx) return notFound("Store not found");

	const rows = await db
		.select()
		.from(categories)
		.where(and(eq(categories.storeId, ctx.storeId), eq(categories.isActive, true)))
		.orderBy(categories.sortOrder);

	const response = ok(
		{ categories: rows },
		{
			headers: {
				'Cache-Control': CACHE_CONFIG.CATEGORIES.cacheControl,
			},
		}
	);

	response.headers.set('Cache-Tag', CACHE_CONFIG.CATEGORIES.tags(slug).join(', '));
	return response;
}

// POST - Create category
export async function POST(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await getApiContext(request, slug, { requireOwner: true });
	if (ctx instanceof Response) return ctx;

	try {
		const body = await request.json();
		const { name, description, image, color, sortOrder } = body;

		if (!name || typeof name !== 'string' || !name.trim()) {
			return badRequest('Category name is required');
		}

		const categorySlug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		const categoryId = createId();

		await db.insert(categories).values({
			id: categoryId,
			storeId: ctx.storeId,
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

		revalidateCategoryCache(slug);

		return created(
			{ category: newCategory },
			{
				headers: {
					'Cache-Control': CACHE_CONFIG.MUTATION.cacheControl,
				},
			}
		);
	} catch (error) {
		await logRouteError('Failed to create category', error, params, { storeId: ctx.storeId });
		return serverError('Failed to create category');
	}
}

// PUT - Update category
export async function PUT(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await getApiContext(request, slug, { requireOwner: true });
	if (ctx instanceof Response) return ctx;

	try {
		const body = await request.json();
		const { id, name, description, image, color, sortOrder } = body;

		if (!id) {
			return badRequest('Category ID is required');
		}

		if (!name || typeof name !== 'string' || !name.trim()) {
			return badRequest('Category name is required');
		}

		const [existing] = await db
			.select()
			.from(categories)
			.where(and(eq(categories.id, id), eq(categories.storeId, ctx.storeId)));

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

		revalidateCategoryCache(slug);

		return ok(
			{ category: updatedCategory },
			{
				headers: {
					'Cache-Control': CACHE_CONFIG.MUTATION.cacheControl,
				},
			}
		);
	} catch (error) {
		await logRouteError('Failed to update category', error, params, { storeId: ctx.storeId });
		return serverError('Failed to update category');
	}
}

// DELETE - Delete category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await getApiContext(request, slug, { requireOwner: true });
	if (ctx instanceof Response) return ctx;

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
			.where(and(eq(categories.id, categoryId), eq(categories.storeId, ctx.storeId)));

		if (!existing) {
			return notFound('Category not found');
		}

		await db
			.update(categories)
			.set({ isActive: false, updatedAt: new Date() })
			.where(eq(categories.id, categoryId));

		revalidateCategoryCache(slug);

		return ok(
			{ success: true },
			{
				headers: {
					'Cache-Control': CACHE_CONFIG.MUTATION.cacheControl,
				},
			}
		);
	} catch (error) {
		await logRouteError('Failed to delete category', error, params, { storeId: ctx.storeId });
		return serverError('Failed to delete category');
	}
}

