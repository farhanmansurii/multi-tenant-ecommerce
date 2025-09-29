import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import StorefrontProductView from '@/components/features/storefront/product-detail-view';
import { generateBaseMetadata, generateProductMetadata } from '@/lib/metadata';
import type { ProductData } from '@/lib/types/product';
import type { StoreData } from '@/lib/types/store';
import { fetchStoreAndProduct } from '@/lib/services/product-api';

interface RouteParams {
	slug: string;
	productSlug: string;
}

const buildNotFoundMetadata = (slug: string, productSlug: string): Metadata =>
	generateBaseMetadata({
		title: 'Product unavailable',
		description: 'The product you are looking for is not available.',
		url: `/stores/${slug}/products/${productSlug}`,
		type: 'product',
		keywords: ['product not found', 'unavailable'],
	});

const toIsoString = (value: string | Date | null | undefined): string | undefined => {
	if (!value) return undefined;
	return value instanceof Date ? value.toISOString() : value;
};

const toProductMetadata = (store: StoreData, product: ProductData): Metadata =>
	generateProductMetadata({
		storeName: store.name,
		storeSlug: store.slug,
		productName: product.metaTitle ?? product.name,
		productDescription:
			product.metaDescription ?? product.shortDescription ?? product.description,
		productPrice: product.price,
		productImages: product.images.map((image) => image.url).filter(Boolean),
		publishedTime: toIsoString(product.publishedAt),
		modifiedTime: toIsoString(product.updatedAt),
		tags: product.tags,
		url: `${store.slug}/products/${product.slug}`,
	});

export async function generateMetadata({
	params,
}: {
	params: Promise<RouteParams>;
}): Promise<Metadata> {
	const { slug, productSlug } = await params;
	const result = await fetchStoreAndProduct(slug, productSlug);

	if (!result) {
		return buildNotFoundMetadata(slug, productSlug);
	}

	return toProductMetadata(result.store, result.product);
}

export default async function StorefrontProductPage({ params }: { params: Promise<RouteParams> }) {
	const { slug, productSlug } = await params;
	const result = await fetchStoreAndProduct(slug, productSlug);

	if (!result) {
		notFound();
	}

	return <StorefrontProductView store={result.store} product={result.product} />;
}
