import { StateCreator } from 'zustand';

import type { CartItem, CartSlice, CartSummary, StorefrontState } from './types';

const recalculateCart = (items: CartItem[]): Pick<CartSummary, 'subtotal' | 'totalQuantity'> => {
	return items.reduce(
		(acc, item) => {
			acc.totalQuantity += item.quantity;
			acc.subtotal += item.price * item.quantity;
			return acc;
		},
		{ subtotal: 0, totalQuantity: 0 }
	);
};

const matchCartItem = (item: CartItem, productId: string, variantId?: string | null) => {
	if (item.productId !== productId) return false;
	if (!variantId) return !item.variantId;
	return item.variantId === variantId;
};

export const createCartSlice: StateCreator<StorefrontState, [], [], CartSlice> = (
	set,
	_get,
	_api
) => ({
	cart: {
		items: [],
		subtotal: 0,
		totalQuantity: 0,
	},

	addItem: (incoming) => {
		set((state) => {
			const items = [...state.cart.items];
			const index = items.findIndex((item) =>
				matchCartItem(item, incoming.productId, incoming.variantId)
			);

			if (index >= 0) {
				const existing = items[index];
				items[index] = {
					...existing,
					quantity: existing.quantity + incoming.quantity,
				};
			} else {
				items.push({ ...incoming });
			}

			const { subtotal, totalQuantity } = recalculateCart(items);

			return {
				cart: {
					items,
					subtotal,
					totalQuantity,
				},
			};
		});
	},

	updateQuantity: (productId, quantity, variantId) => {
		set((state) => {
			const items = [...state.cart.items];
			const index = items.findIndex((item) => matchCartItem(item, productId, variantId));

			if (index === -1) return state;

			if (quantity <= 0) {
				items.splice(index, 1);
			} else {
				items[index] = { ...items[index], quantity };
			}

			const { subtotal, totalQuantity } = recalculateCart(items);

			return {
				cart: {
					items,
					subtotal,
					totalQuantity,
				},
			};
		});
	},

	removeItem: (productId, variantId) => {
		set((state) => {
			const filtered = state.cart.items.filter(
				(item) => !matchCartItem(item, productId, variantId)
			);

			if (filtered.length === state.cart.items.length) {
				return state;
			}

			const { subtotal, totalQuantity } = recalculateCart(filtered);

			return {
				cart: {
					items: filtered,
					subtotal,
					totalQuantity,
				},
			};
		});
	},

	clearCart: () => {
		set({
			cart: {
				items: [],
				subtotal: 0,
				totalQuantity: 0,
			},
		});
	},

	hydrateCart: (items) => {
		const sanitized = items.map((item) => ({ ...item }));
		const { subtotal, totalQuantity } = recalculateCart(sanitized);

		set({
			cart: {
				items: sanitized,
				subtotal,
				totalQuantity,
			},
		});
	},
});
