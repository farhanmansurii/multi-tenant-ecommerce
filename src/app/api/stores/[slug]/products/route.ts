import { NextResponse } from 'next/server';

import { storeHelpers } from '@/lib/domains/stores';
import { productHelpers } from '@/lib/domains/products';
import { db } from '@/lib/db';
import { products as productsTable, categories as categoriesTable } from '@/lib/db/schema';
import { desc, eq, sql, inArray } from 'drizzle-orm';

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

export async function GET(request: Request, { params }: RouteParams) {
	const { slug } = await params;
	const url = new URL(request.url);

	// Parse pagination params with sensible defaults
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
	const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
	const offset = (page - 1) * limit;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: 'Store not found' }, { status: 404 });
	}

	// Get total count efficiently
	const [countResult] = await db
		.select({ count: sql<number>`COUNT(*)::int` })
		.from(productsTable)
		.where(eq(productsTable.storeId, store.id));

	const total = countResult?.count || 0;

	// Get paginated products
	type ProductRow = typeof productsTable.$inferSelect;
	const products: ProductRow[] = await db
		.select()
		.from(productsTable)
		.where(eq(productsTable.storeId, store.id))
		.orderBy(desc(productsTable.createdAt))
		.limit(limit)
		.offset(offset);

	// Fetch category names
	const categoryIds = new Set<string>();
	products.forEach((p) => {
		if (Array.isArray(p.categories)) {
			p.categories.forEach((id) => {
				if (typeof id === 'string') categoryIds.add(id);
			});
		}
	});

	const categoryMap = new Map<string, string>();
	if (categoryIds.size > 0) {
		const cats = await db
			.select({ id: categoriesTable.id, name: categoriesTable.name })
			.from(categoriesTable)
			.where(inArray(categoriesTable.id, Array.from(categoryIds)));
		cats.forEach((c) => categoryMap.set(c.id, c.name));
	}

	const enrichedProducts = products.map((p) => ({
		...p,
		categories: Array.isArray(p.categories)
			? p.categories.map((id) => ({
					id: id as string,
					name: categoryMap.get(id as string) || 'Unknown',
			  }))
			: [],
	}));

	return NextResponse.json({
		store: { id: store.id, slug: store.slug, name: store.name },
		products: enrichedProducts,
		total,
		page,
		limit,
		totalPages: Math.ceil(total / limit),
	});
}

export async function POST(request: Request, { params }: RouteParams) {
	const { slug } = await params;
	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: 'Store not found' }, { status: 404 });
	}

	const body = await request.json();

	function toSlug(input: string): string {
		return input
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-zA-Z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.toLowerCase();
	}

	let finalSlug: string | undefined = body.slug;
	if (!finalSlug) {
		const base =
			typeof body.name === 'string' && body.name.trim().length > 0
				? body.name
				: crypto.randomUUID();
		let candidate = toSlug(base);
		if (candidate.length === 0) candidate = crypto.randomUUID();
		let unique = candidate;
		let i = 1;
		while (true) {
			const exists = await productHelpers.getProductBySlug(store.id, unique);
			if (!exists) break;
			unique = `${candidate}-${++i}`;
		}
		finalSlug = unique;
	}

	const product = await productHelpers.createProduct(store.id, { ...body, slug: finalSlug });
	return NextResponse.json({ product }, { status: 201 });
}
