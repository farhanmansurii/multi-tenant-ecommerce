import type { ProductData } from '@/lib/domains/products/types';

type ProductRow = typeof import('@/lib/db/schema/ecommerce/products').products.$inferSelect;

export const normalizeArray = <T>(value: T[] | null | undefined): T[] =>
	Array.isArray(value) ? value : [];

export const normalizeProduct = (product: ProductRow | ProductData): ProductData => {
	const base = product as unknown as ProductData;
	return {
		...base,
		images: normalizeArray(base.images),
		variants: normalizeArray((base as ProductData).variants || []),
		categories: normalizeArray(base.categories),
		tags: normalizeArray(base.tags),
	};
};

export const normalizeProducts = (
	items: Array<ProductRow | ProductData> | null | undefined
): ProductData[] => (Array.isArray(items) ? items.map((item) => normalizeProduct(item)) : []);
