import { NextRequest } from 'next/server';
import { storeHelpers } from '@/lib/domains/stores';
import { productHelpers } from '@/lib/domains/products';
import { db } from '@/lib/db';
import { categories as categoriesTable } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import { ok, notFound, badRequest, serverError, logRouteError } from '@/lib/api/responses';

interface RouteParams {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
}

async function getStoreAndProduct(slug: string, productSlug: string) {
  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) {
    return { error: notFound('Store not found') };
  }

  const product = await productHelpers.getProductBySlug(store.id, productSlug);
  if (!product) {
    return { error: notFound('Product not found') };
  }

  return { store, product };
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

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug, productSlug } = await params;

    const result = await getStoreAndProduct(slug, productSlug);
    if ('error' in result) return result.error;

    const { store, product } = result;
    const enrichedProduct = await enrichProductCategories(product);

    return ok({
      product: enrichedProduct,
      store: { id: store.id, slug: store.slug, name: store.name },
    });
  } catch (error) {
    await logRouteError('Error fetching product', error, params);
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug, productSlug } = await params;

    const result = await getStoreAndProduct(slug, productSlug);
    if ('error' in result) return result.error;

    const { store, product } = result;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return badRequest('Invalid request body');
    }

    const updated = await productHelpers.updateProduct(product.id, body);
    const enrichedProduct = await enrichProductCategories(updated);

    return ok({
      product: enrichedProduct,
      store: { id: store.id, slug: store.slug, name: store.name },
    });
  } catch (error) {
    await logRouteError('Error updating product', error, params);
    return serverError('Failed to update product');
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug, productSlug } = await params;

    const result = await getStoreAndProduct(slug, productSlug);
    if ('error' in result) return result.error;

    const { product } = result;

    await productHelpers.deleteProduct(product.id);

    return ok({ success: true });
  } catch (error) {
    await logRouteError('Error deleting product', error, params);
    return serverError('Failed to delete product');
  }
}
