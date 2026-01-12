import { NextRequest } from 'next/server';

import { storeHelpers } from '@/lib/domains/stores';
import { productHelpers } from '@/lib/domains/products';
import { db } from '@/lib/db';
import { products as productsTable, categories as categoriesTable } from '@/lib/db/schema';
import { desc, eq, sql, inArray } from 'drizzle-orm';
import { ok, notFound, created, badRequest, serverError, logRouteError } from '@/lib/api/responses';

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { slug } = await params;
		const url = new URL(request.url);

		// Parse pagination params with sensible defaults
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
		const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
		const offset = (page - 1) * limit;

		const store = await storeHelpers.getStoreBySlug(slug);
		if (!store) {
			return notFound('Store not found');
		}

		// Run count and products query in parallel for better performance
		type ProductRow = typeof productsTable.$inferSelect;
		const [countResult, products] = await Promise.all([
			db
				.select({ count: sql<number>`COUNT(*)::int` })
				.from(productsTable)
				.where(eq(productsTable.storeId, store.id)),
			db
				.select()
				.from(productsTable)
				.where(eq(productsTable.storeId, store.id))
				.orderBy(desc(productsTable.createdAt))
				.limit(limit)
				.offset(offset),
		]);

		const total = countResult[0]?.count || 0;
		const productsArray: ProductRow[] = products;

		// Collect category IDs from products
		const categoryIds = new Set<string>();
		productsArray.forEach((p) => {
			if (Array.isArray(p.categories)) {
				p.categories.forEach((id) => {
					if (typeof id === 'string') categoryIds.add(id);
				});
			}
		});

		// Fetch category names only if needed
		const categoryMap = new Map<string, string>();
		if (categoryIds.size > 0) {
			const cats = await db
				.select({ id: categoriesTable.id, name: categoriesTable.name })
				.from(categoriesTable)
				.where(inArray(categoriesTable.id, Array.from(categoryIds)));
			cats.forEach((c) => categoryMap.set(c.id, c.name));
		}

		const enrichedProducts = productsArray.map((p) => ({
			...p,
			categories: Array.isArray(p.categories)
				? p.categories.map((id) => ({
						id: id as string,
						name: categoryMap.get(id as string) || 'Unknown',
				  }))
				: [],
		}));

		return ok(
			{
				store: { id: store.id, slug: store.slug, name: store.name },
				products: enrichedProducts,
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
			{
				headers: {
					'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
				},
			}
		);
	} catch (error) {
		await logRouteError('Error fetching products', error, params);
		return serverError();
	}
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	let storeId: string | undefined;
	try {
		const { slug } = await params;
		const store = await storeHelpers.getStoreBySlug(slug);
		if (!store) {
			return notFound('Store not found');
		}

		storeId = store.id;

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
		return created({ product });
	} catch (error) {
		await logRouteError('Error creating product', error, params, { storeId });
		return serverError('Failed to create product');
	}
}
