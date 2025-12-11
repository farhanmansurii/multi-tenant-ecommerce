import { NextResponse } from 'next/server';
import { storeHelpers } from '@/lib/domains/stores';
import { productHelpers } from '@/lib/domains/products';
import { db } from '@/lib/db';
import { categories as categoriesTable } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';

interface RouteParams {
	params: Promise<{
		slug: string;
		productSlug: string;
	}>;
}

export async function GET(_request: Request, { params }: RouteParams) {
	const { slug, productSlug } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store)
		return NextResponse.json({ error: 'Store not found' }, { status: 404 });


	const product = await productHelpers.getProductBySlug(store.id, productSlug);
	if (!product)
		return NextResponse.json({ error: 'Product not found' }, { status: 404 });


	// Fetch category names
	let enrichedProduct = { ...product, categories: [] as { id: string; name: string }[] };
	if (Array.isArray(product.categories) && product.categories.length > 0) {
		const categoryIds = product.categories.filter((id): id is string => typeof id === 'string');
		if (categoryIds.length > 0) {
			const cats = await db
				.select({ id: categoriesTable.id, name: categoriesTable.name })
				.from(categoriesTable)
				.where(inArray(categoriesTable.id, categoryIds));

			const categoryMap = new Map(cats.map(c => [c.id, c.name]));

			enrichedProduct.categories = categoryIds.map(id => ({
				id,
				name: categoryMap.get(id) || 'Unknown'
			}));
		}
	}

	return NextResponse.json({
		product: enrichedProduct,
		store: { id: store.id, slug: store.slug, name: store.name },
	});
}
