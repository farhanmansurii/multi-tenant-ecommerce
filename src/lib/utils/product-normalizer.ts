import type { ProductData } from '@/lib/types/product';

type ProductRow = typeof import('@/lib/db/schema/product').products.$inferSelect;

export const normalizeArray = <T>(value: T[] | null | undefined): T[] =>
	Array.isArray(value) ? value : [];

export const normalizeProduct = (product: ProductRow | ProductData): ProductData => ({
	...product,
	images: normalizeArray(product.images),
	variants: normalizeArray(product.variants),
	categories: normalizeArray(product.categories),
	tags: normalizeArray(product.tags),
});

export const normalizeProducts = (
	items: Array<ProductRow | ProductData> | null | undefined
): ProductData[] => (Array.isArray(items) ? items.map((item) => normalizeProduct(item)) : []);
