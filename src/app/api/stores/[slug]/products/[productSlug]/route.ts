import { NextRequest } from 'next/server';
import { productHelpers } from '@/lib/domains/products';
import { getApiContextOrNull, getApiContext } from '@/lib/api/context';
import { db } from '@/lib/db';
import { categories as categoriesTable } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import { ok, notFound, badRequest, serverError, logRouteError } from '@/lib/api/responses';
import { CACHE_CONFIG } from '@/lib/api/cache-config';
import { revalidateProductCache } from '@/lib/api/cache-revalidation';

interface RouteParams {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
}

export const revalidate = 120;

async function getStoreAndProduct(ctx: Awaited<ReturnType<typeof getApiContextOrNull>>, productSlug: string) {
  if (ctx instanceof Response || !ctx) {
    return { error: ctx || notFound('Store not found') };
  }

  const product = await productHelpers.getProductBySlug(ctx.storeId, productSlug);
  if (!product) {
    console.error('Product not found:', { storeId: ctx.storeId, productSlug, storeSlug: ctx.store.slug });
    return { error: notFound(`Product not found: ${productSlug} in store ${ctx.store.slug}`) };
  }

  return { store: ctx.store, product };
}

async function enrichProductCategories(product: any) {
  let enrichedProduct = { ...product, categories: [] as { id: string; name: string }[] };

  if (Array.isArray(product.categories) && product.categories.length > 0) {
    const categoryIds = product.categories.filter((id: any): id is string => typeof id === 'string');

    if (categoryIds.length > 0) {
      const cats = await db
        .select({ id: categoriesTable.id, name: categoriesTable.name })
        .from(categoriesTable)
        .where(inArray(categoriesTable.id, categoryIds));

      const categoryMap = new Map(cats.map((c) => [c.id, c.name]));

      enrichedProduct.categories = categoryIds.map((id: any): { id: string; name: string } => ({
        id,
        name: categoryMap.get(id) || 'Unknown',
      }));
    }
  }

  return enrichedProduct;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug, productSlug } = await params;

    const ctx = await getApiContextOrNull(request, slug);
    const result = await getStoreAndProduct(ctx, productSlug);
    if ('error' in result) return result.error;

    const { store, product } = result;
    const enrichedProduct = await enrichProductCategories(product);

    const response = ok(
      {
        product: enrichedProduct,
        store: { id: store.id, slug: store.slug, name: store.name },
      },
      {
        headers: {
          'Cache-Control': CACHE_CONFIG.PRODUCT.cacheControl,
        },
      }
    );

    response.headers.set('Cache-Tag', CACHE_CONFIG.PRODUCT.tags(slug, productSlug).join(', '));
    return response;
  } catch (error) {
    await logRouteError('Error fetching product', error, params);
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug, productSlug } = await params;

    const ctx = await getApiContext(request, slug, { requireOwner: true });
    if (ctx instanceof Response) return ctx;

    const result = await getStoreAndProduct(ctx, productSlug);
    if ('error' in result) return result.error;

    const { store, product } = result;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return badRequest('Invalid request body');
    }

    const updated = await productHelpers.updateProduct(product.id, body);

    if (!updated) {
      return notFound('Product not found or update failed');
    }

    const enrichedProduct = await enrichProductCategories(updated);

    revalidateProductCache(slug, productSlug);

    return ok(
      {
        product: enrichedProduct,
        store: { id: store.id, slug: store.slug, name: store.name },
      },
      {
        headers: {
          'Cache-Control': CACHE_CONFIG.MUTATION.cacheControl,
        },
      }
    );
  } catch (error) {
    await logRouteError('Error updating product', error, params);
    return serverError('Failed to update product');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug, productSlug } = await params;

    const ctx = await getApiContext(request, slug, { requireOwner: true });
    if (ctx instanceof Response) return ctx;

    const result = await getStoreAndProduct(ctx, productSlug);
    if ('error' in result) return result.error;

    const { store, product } = result;

    await productHelpers.deleteProduct(product.id);

    revalidateProductCache(slug, productSlug);

    return ok(
      { success: true },
      {
        headers: {
          'Cache-Control': CACHE_CONFIG.MUTATION.cacheControl,
        },
      }
    );
  } catch (error) {
    await logRouteError('Error deleting product', error, params);
    return serverError('Failed to delete product');
  }
}
