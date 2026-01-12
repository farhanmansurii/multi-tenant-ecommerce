import { NextRequest } from 'next/server';
import { unstable_cache } from 'next/cache';

import { productHelpers } from '@/lib/domains/products';
import { getApiContextOrNull, getApiContext } from '@/lib/api/context';
import { db } from '@/lib/db';
import { products as productsTable, categories as categoriesTable } from '@/lib/db/schema';
import { desc, eq, sql, inArray } from 'drizzle-orm';
import { ok, notFound, created, badRequest, serverError, logRouteError } from '@/lib/api/responses';
import { CACHE_CONFIG } from '@/lib/api/cache-config';
import { revalidateProductCache } from '@/lib/api/cache-revalidation';

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

export const revalidate = 60;

export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { slug } = await params;
		const url = new URL(request.url);

		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
		const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
		const offset = (page - 1) * limit;

		const ctx = await getApiContextOrNull(request, slug);
		if (ctx instanceof Response) return ctx;
		if (!ctx) return notFound('Store not found');

		const [countResult, products] = await Promise.all([
			db
				.select({ count: sql<number>`COUNT(*)::int` })
				.from(productsTable)
				.where(eq(productsTable.storeId, ctx.storeId)),
			db
				.select({
					id: productsTable.id,
					name: productsTable.name,
					slug: productsTable.slug,
					description: productsTable.description,
					shortDescription: productsTable.shortDescription,
					sku: productsTable.sku,
					type: productsTable.type,
					status: productsTable.status,
					price: productsTable.price,
					compareAtPrice: productsTable.compareAtPrice,
					quantity: productsTable.quantity,
					images: productsTable.images,
					categories: productsTable.categories,
					tags: productsTable.tags,
					featured: productsTable.featured,
					createdAt: productsTable.createdAt,
					updatedAt: productsTable.updatedAt,
				})
				.from(productsTable)
				.where(eq(productsTable.storeId, ctx.storeId))
				.orderBy(desc(productsTable.createdAt))
				.limit(limit)
				.offset(offset),
		]);

		const total = countResult[0]?.count || 0;

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

		const response = ok(
			{
				store: { id: ctx.store.id, slug: ctx.store.slug, name: ctx.store.name },
				products: enrichedProducts,
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
			{
				headers: {
					'Cache-Control': CACHE_CONFIG.PRODUCTS.cacheControl,
				},
			}
		);

		response.headers.set('Cache-Tag', CACHE_CONFIG.PRODUCTS.tags(slug).join(', '));
		return response;
	} catch (error) {
		await logRouteError('Error fetching products', error, params);
		return serverError();
	}
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	let storeId: string | undefined;
	try {
		const { slug } = await params;
		const ctx = await getApiContext(request, slug, { requireOwner: true });
		if (ctx instanceof Response) return ctx;

		storeId = ctx.storeId;

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
				const exists = await productHelpers.getProductBySlug(ctx.storeId, unique);
				if (!exists) break;
				unique = `${candidate}-${++i}`;
			}
			finalSlug = unique;
		}

		const product = await productHelpers.createProduct(ctx.storeId, { ...body, slug: finalSlug });

		revalidateProductCache(slug);

		return created(
			{ product },
			{
				headers: {
					'Cache-Control': CACHE_CONFIG.MUTATION.cacheControl,
				},
			}
		);
	} catch (error) {
		await logRouteError('Error creating product', error, params, { storeId });
		return serverError('Failed to create product');
	}
}
