import { ProductData } from '@/lib/types/product';
import { StoreData } from '../types/store';

export const fetchProduct = async (
	storeSlug: string,
	productSlug: string
): Promise<ProductData> => {
	const response = await fetch(`/api/stores/${storeSlug}/products/${productSlug}`);
	if (!response.ok) {
		throw new Error(response.status === 404 ? 'Product not found' : 'Failed to load product');
	}
	const data = await response.json();
	return data.product;
};

export const updateProduct = async (
	storeSlug: string,
	productSlug: string,
	data: Partial<ProductData>
): Promise<ProductData> => {
	const response = await fetch(`/api/stores/${storeSlug}/products/${productSlug}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		throw new Error(errorData?.error || 'Failed to update product');
	}

	return response.json();
};

export const createProduct = async (
	storeSlug: string,
	data: Partial<ProductData>
): Promise<ProductData> => {
	const response = await fetch(`/api/stores/${storeSlug}/products`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		throw new Error(errorData?.error || 'Failed to create product');
	}

	const result = await response.json();
	return result.product;
};

export const deleteProduct = async (storeSlug: string, productSlug: string): Promise<void> => {
	const response = await fetch(`/api/stores/${storeSlug}/products/${productSlug}`, {
		method: 'DELETE',
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		throw new Error(errorData?.error || 'Failed to delete product');
	}
};

export async function fetchProducts(slug: string): Promise<ProductData[]> {
	const res = await fetch(`/api/stores/${slug}/products`);
	if (!res.ok) return [];
	const payload = await res.json();
	return Array.isArray(payload.products) ? (payload.products as ProductData[]) : [];
}
