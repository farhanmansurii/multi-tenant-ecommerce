'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { CartSummary, StorefrontCustomerProfile, StorefrontState } from './types';
import { createCartSlice } from './cart-slice';
import { createStorefrontSessionSlice } from './session-slice';
import { createCustomerSlice } from './customer-slice';

const storage =
	typeof window === 'undefined'
		? undefined
		: createJSONStorage<{
			cart: CartSummary;
			storeSlug: string | null;
			selectedCategoryId: string | null;
			customerProfile: StorefrontCustomerProfile | null;
		}>(() => window.localStorage);

export const useStorefrontStore = create<StorefrontState>()(
	persist(
		(set, get, api) => ({
			...createCartSlice(set, get, api),
			...createStorefrontSessionSlice(set, get, api),
			...createCustomerSlice(set, get, api),
		}),
		{
			name: 'storefront-store',
			storage,
			partialize: (state) => ({
				cart: state.cart,
				storeSlug: state.storeSlug,
				selectedCategoryId: state.selectedCategoryId,
				customerProfile: state.customerProfile,
			}),
		}
	)
);
