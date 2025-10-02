import { NextResponse } from 'next/server';
import { storeHelpers } from '@/lib/domains/stores';
import { productHelpers } from '@/lib/domains/products';

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


	return NextResponse.json({
		product,
		store: { id: store.id, slug: store.slug, name: store.name },
	});
}
