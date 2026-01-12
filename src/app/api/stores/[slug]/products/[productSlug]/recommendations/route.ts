import { NextRequest } from 'next/server';

import { storeHelpers } from '@/lib/domains/stores';
import { productHelpers } from '@/lib/domains/products';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { ok, notFound, serverError, logRouteError } from '@/lib/api/responses';

interface RouteParams {
	params: Promise<{
		slug: string;
		productSlug: string;
	}>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { slug, productSlug } = await params;

		const store = await storeHelpers.getStoreBySlug(slug);
		if (!store) {
			return notFound('Store not found');
		}

		const current = await productHelpers.getProductBySlug(store.id, productSlug);
		if (!current) {
			return notFound('Product not found');
		}

	const currentCategories = Array.isArray(current.categories)
		? (current.categories as string[])
		: [];
	const currentTags = Array.isArray(current.tags) ? (current.tags as string[]) : [];

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
      WHERE p.store_id = ${store.id}
        AND p.id <> ${current.id}
    )
    SELECT * FROM candidates
    WHERE score > 0
    ORDER BY score DESC, created_at DESC
    LIMIT 8;
  `);

	const rows = (result as unknown as { rows: Record<string, unknown>[] }).rows || [];
	const products = rows.map((row) => {
		const { created_at, updated_at, ...rest } = row as Record<string, unknown>;
		return {
			...rest,
			createdAt: created_at,
			updatedAt: updated_at,
		};
	});

	return ok({ products });
	} catch (error) {
		await logRouteError('Error fetching product recommendations', error, params);
		return serverError();
	}
}
