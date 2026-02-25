import type { NextRequest } from 'next/server';
import { productHelpers } from '@/lib/domains/products';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { ok, notFound, serverError, logRouteError } from '@/lib/api/responses';
import { getApiContextOrNull } from '@/lib/api/context';
import { CACHE_CONFIG } from '@/lib/api/cache-config';

interface RouteParams {
	params: Promise<{
		slug: string;
		productSlug: string;
	}>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { slug, productSlug } = await params;

		const ctx = await getApiContextOrNull(request, slug);
		if (ctx instanceof Response) return ctx;
		if (!ctx) return notFound('Store not found');

		const current = await productHelpers.getProductBySlug(ctx.storeId, productSlug);
		if (!current) {
			return notFound('Product not found');
		}

		const currentCategories = Array.isArray(current.categories)
			? current.categories.filter((id): id is string => typeof id === 'string')
			: [];
		const currentTags = Array.isArray(current.tags)
			? current.tags.filter((id): id is string => typeof id === 'string')
			: [];

		// Compute score in SQL using overlaps with categories/tags
		const result = await db.execute(sql`
    WITH candidates AS (
      SELECT p.*,
        (
          COALESCE((
            SELECT COUNT(1)
            FROM jsonb_array_elements_text(p.categories) AS c(id)
            WHERE ${
							currentCategories.length > 0
								? sql`c.id = ANY(${currentCategories}::text[])`
								: sql`1=0`
						}
          ), 0) * 2
          +
          COALESCE((
            SELECT COUNT(1)
            FROM jsonb_array_elements_text(p.tags) AS t(id)
            WHERE ${
							currentTags.length > 0
								? sql`t.id = ANY(${currentTags}::text[])`
								: sql`1=0`
						}
          ), 0)
        ) AS score
      FROM products p
      WHERE p.store_id = ${ctx.storeId}
        AND p.id <> ${current.id}
    )
    SELECT * FROM candidates
    WHERE score > 0
    ORDER BY score DESC, created_at DESC
    LIMIT 8;
  `);

		type RecommendationRow = Record<string, unknown> & {
			created_at?: unknown;
			updated_at?: unknown;
		};
		const rows = (result as { rows?: RecommendationRow[] }).rows ?? [];
		const products = rows.map((row) => {
			const { created_at, updated_at, ...rest } = row;
			return {
				...rest,
				createdAt: created_at,
				updatedAt: updated_at,
			};
		});

		const response = ok(
			{ products },
			{
				headers: {
					'Cache-Control': CACHE_CONFIG.PRODUCT.cacheControl,
				},
			}
		);
		response.headers.set('Cache-Tag', CACHE_CONFIG.PRODUCT.tags(slug, productSlug).join(', '));
		return response;
	} catch (error) {
		await logRouteError('Error fetching product recommendations', error, params);
		return serverError();
	}
}
