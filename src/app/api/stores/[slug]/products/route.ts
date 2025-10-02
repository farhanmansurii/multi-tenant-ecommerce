import { NextResponse } from 'next/server';

import { storeHelpers } from '@/lib/domains/stores';
import { productHelpers } from '@/lib/domains/products';
import { db } from '@/lib/db';
import { products as productsTable } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

export async function GET(request: Request, { params }: RouteParams) {
	const { slug } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: 'Store not found' }, { status: 404 });
	}

	const url = new URL(request.url);
	const q = url.searchParams.get('q') || '';
	const sort = url.searchParams.get('sort') || 'relevance';
	const min = url.searchParams.get('min');
	const max = url.searchParams.get('max');
	const stock = url.searchParams.get('stock') === '1';
	const categoryParams = url.searchParams.getAll('category');
	const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
	const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('perPage') || '24')));
	const offset = (page - 1) * perPage;

  // Fetch plain products with Drizzle and apply filters that are hard to express with casts
  type ProductRow = typeof productsTable.$inferSelect

  let rows: ProductRow[] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.storeId, store.id))
    .orderBy(desc(productsTable.createdAt));

  // Text search
  if (q) {
    const qLower = q.toLowerCase();
    rows = rows.filter((p: ProductRow) =>
      (p.name || '').toLowerCase().includes(qLower) ||
      (p.description || '').toLowerCase().includes(qLower) ||
      ((p as unknown as { shortDescription?: string }).shortDescription || '').toLowerCase().includes(qLower)
    );
  }

  // Price range (price stored as text)
  const minNum = Number(min);
  const maxNum = Number(max);
  if (Number.isFinite(minNum)) rows = rows.filter((p: ProductRow) => Number((p as unknown as { price?: string }).price ?? '0') >= minNum);
  if (Number.isFinite(maxNum)) rows = rows.filter((p: ProductRow) => Number((p as unknown as { price?: string }).price ?? '0') <= maxNum);

  // Stock
  if (stock) {
    rows = rows.filter((p: ProductRow) => {
      const qty = Number(((p as unknown as { quantity?: string }).quantity) ?? '0');
      return p.status === 'active' && (qty > 0 || Boolean((p as unknown as { allowBackorder?: boolean }).allowBackorder));
    });
  }

  // Categories (array membership)
  if (categoryParams.length > 0) {
    rows = rows.filter((p: ProductRow) => {
      const ids = Array.isArray((p as unknown as { categories?: string[] }).categories)
        ? ((p as unknown as { categories?: string[] }).categories as string[])
        : [];
      return categoryParams.every((c) => ids.includes(c));
    });
  }

  // Sort
  if (sort === 'price_asc') rows = [...rows].sort((a: ProductRow, b: ProductRow) => Number((a as unknown as { price?: string }).price ?? '0') - Number((b as unknown as { price?: string }).price ?? '0'));
  else if (sort === 'price_desc') rows = [...rows].sort((a: ProductRow, b: ProductRow) => Number((b as unknown as { price?: string }).price ?? '0') - Number((a as unknown as { price?: string }).price ?? '0'));
  else if (sort === 'newest') rows = [...rows].sort((a: ProductRow, b: ProductRow) => new Date(((b as unknown as { createdAt?: string | Date }).createdAt) ?? 0).getTime() - new Date(((a as unknown as { createdAt?: string | Date }).createdAt) ?? 0).getTime());

  const total = rows.length;
  const products = rows.slice(offset, offset + perPage);

  return NextResponse.json({ store: { id: store.id, slug: store.slug, name: store.name }, products, total, page, perPage });
}

export async function POST(request: Request, { params }: RouteParams) {
	const { slug } = await params;
	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: 'Store not found' }, { status: 404 });
	}

	const body = await request.json();
	const product = await productHelpers.createProduct(store.id, body);
	return NextResponse.json({ product }, { status: 201 });
}
