import type { ProductData, ProductInput } from '@/lib/domains/products/types';
import type { StoreData } from '@/lib/domains/stores/types';
import { fetchStore } from '@/lib/domains/stores/service';
import { withBaseUrl } from '@/lib/utils/url';
import { normalizeProduct, normalizeProducts } from '@/lib/utils/product-normalizer';
import { parseApiResponse, unwrapApiData } from '@/lib/query/api-response';

export const fetchProduct = async (
	storeSlug: string,
	productSlug: string
): Promise<ProductData> => {
	const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/products/${productSlug}`));
	const data = await parseApiResponse<{ product: ProductData }>(
		response,
		response.status === 404 ? 'Product not found' : 'Failed to load product'
	);
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

	const responseData = await parseApiResponse<{ product: ProductData } | ProductData>(
		response,
		'Failed to update product'
	);
	const normalizedProduct = isProductEnvelope(responseData) ? responseData.product : responseData;
	return normalizeProduct(normalizedProduct);
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

	const result = await parseApiResponse<{ product: ProductData } | ProductData>(
		response,
		'Failed to create product'
	);
	const normalizedProduct = isProductEnvelope(result) ? result.product : result;
	return normalizeProduct(normalizedProduct);
};

export const deleteProduct = async (storeSlug: string, productSlug: string): Promise<void> => {
	const response = await fetch(withBaseUrl(`/api/stores/${storeSlug}/products/${productSlug}`), {
		method: 'DELETE',
	});

	if (!response.ok) {
		await parseApiResponse<void>(response, 'Failed to delete product');
	}
};

export async function fetchProducts(slug: string): Promise<ProductData[]> {
	const res = await fetch(withBaseUrl(`/api/stores/${slug}/products`));
	if (!res.ok) return [];
	const payload = unwrapApiData<{ products: ProductData[] }>(await res.json());
	return normalizeProducts(payload.products);
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
  const data = unwrapApiData<{ products: ProductData[] }>(await response.json());
  return normalizeProducts(data.products);
}

function isProductEnvelope(
	value: { product: ProductData } | ProductData
): value is { product: ProductData } {
	return typeof value === 'object' && value !== null && 'product' in value;
}
