import { ProductData, ProductInput } from '@/lib/domains/products/types';
import type { StoreData } from '@/lib/domains/stores/types';
import { fetchStore } from '@/lib/domains/stores/service';
import { withBaseUrl } from '@/lib/utils/url';
import { normalizeProduct, normalizeProducts } from '@/lib/utils/product-normalizer';

export const fetchProduct = async (
	storeSlug: string,
	productSlug: string
): Promise<ProductData> => {
	const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/products/${productSlug}`));
	if (!response.ok) {
		throw new Error(response.status === 404 ? 'Product not found' : 'Failed to load product');
	}
	const data = await response.json();
	return normalizeProduct(data.product);
};

export const updateProduct = async (
	storeSlug: string,
	productSlug: string,
	payload: Partial<ProductInput>
): Promise<ProductData> => {
	const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/products/${productSlug}`), {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		throw new Error(errorData?.error || 'Failed to update product');
	}

	const responseData = await response.json();
	return normalizeProduct(responseData.product ?? responseData);
};

export const createProduct = async (
	storeSlug: string,
	payload: Partial<ProductInput>
): Promise<ProductData> => {
	const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/products`), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		throw new Error(errorData?.error || 'Failed to create product');
	}

	const result = await response.json();
	return normalizeProduct(result.product ?? result);
};

export const deleteProduct = async (storeSlug: string, productSlug: string): Promise<void> => {
	const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/products/${productSlug}`), {
		method: 'DELETE',
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		throw new Error(errorData?.error || 'Failed to delete product');
	}
};

export async function fetchProducts(slug: string): Promise<ProductData[]> {
	const res = await fetch(withBaseUrl(`/api/stores/${slug}/products`));
	if (!res.ok) return [];
	const payload = await res.json();
	return normalizeProducts(payload.products as ProductData[]);
}

export const fetchStoreAndProduct = async (
	storeSlug: string,
	productSlug: string
): Promise<{ store: StoreData; product: ProductData } | null> => {
	try {
		const [store, product] = await Promise.all([
			fetchStore(storeSlug),
			fetchProduct(storeSlug, productSlug),
		]);
		return { store, product };
	} catch {
		return null;
	}
};

export async function fetchRecommendations(storeSlug: string, productSlug: string): Promise<ProductData[]> {
  const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/products/${productSlug}/recommendations`));
  if (!response.ok) return [];
  const data = await response.json();
  return normalizeProducts(data.products as ProductData[]);
}
