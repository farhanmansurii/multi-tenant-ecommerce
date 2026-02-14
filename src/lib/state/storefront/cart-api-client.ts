'use client';

type Json = Record<string, unknown>;

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
	const res = await fetch(input, {
		credentials: 'include',
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers || {}),
		},
	});

	if (!res.ok) {
		let msg = `Request failed (${res.status})`;
		try {
			const body = (await res.json()) as { error?: string; message?: string };
			msg = body?.error || body?.message || msg;
		} catch {
			// ignore
		}
		throw new Error(msg);
	}

	return (await res.json()) as T;
}

export async function getCart(slug: string) {
	return apiFetch<{ cart: any }>(`/api/stores/${slug}/cart`, { method: 'GET' });
}

export async function addToCart(slug: string, input: { productId: string; variantId?: string | null; qty: number }) {
	return apiFetch<{ item: any; cartId: string }>(`/api/stores/${slug}/cart`, {
		method: 'POST',
		body: JSON.stringify({
			productId: input.productId,
			variantId: input.variantId || undefined,
			qty: input.qty,
		} satisfies Json),
	});
}

export async function updateCartItemQty(slug: string, itemId: string, qty: number) {
	return apiFetch<{ item: any }>(`/api/stores/${slug}/cart/items/${itemId}`, {
		method: 'PATCH',
		body: JSON.stringify({ qty } satisfies Json),
	});
}

export async function removeCartItem(slug: string, itemId: string) {
	return apiFetch<{ success: true }>(`/api/stores/${slug}/cart/items/${itemId}`, {
		method: 'DELETE',
	});
}

export async function clearCart(slug: string) {
	return apiFetch<{ success: true }>(`/api/stores/${slug}/cart`, { method: 'DELETE' });
}

