import { NextResponse, type NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { withStoreContext } from '@/lib/api/handlers';

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

	return NextResponse.json({ categories: rows });
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
			return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
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

		return NextResponse.json({ category: newCategory }, { status: 201 });
	} catch (error) {
		console.error('Failed to create category:', error);
		return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
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
			return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
		}

		if (!name || typeof name !== 'string' || !name.trim()) {
			return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
		}

		// Verify category belongs to this store
		const [existing] = await db
			.select()
			.from(categories)
			.where(and(eq(categories.id, id), eq(categories.storeId, storeId)));

		if (!existing) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 });
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

		return NextResponse.json({ category: updatedCategory });
	} catch (error) {
		console.error('Failed to update category:', error);
		return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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
			return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
		}

		// Verify category belongs to this store
		const [existing] = await db
			.select()
			.from(categories)
			.where(and(eq(categories.id, categoryId), eq(categories.storeId, storeId)));

		if (!existing) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 });
		}

		// Soft delete by setting isActive to false
		await db
			.update(categories)
			.set({ isActive: false, updatedAt: new Date() })
			.where(eq(categories.id, categoryId));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Failed to delete category:', error);
		return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
	}
}

