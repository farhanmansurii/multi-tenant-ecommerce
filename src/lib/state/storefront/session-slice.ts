import { StateCreator } from 'zustand';

import type { StorefrontSessionSlice, StorefrontState } from './types';

export const createStorefrontSessionSlice: StateCreator<
	StorefrontState,
	[],
	[],
	StorefrontSessionSlice
> = (set) => ({
	storeSlug: null,
	selectedCategoryId: null,
	isCartOpen: false,

	setStoreSlug: (slug) => set({ storeSlug: slug }),

	setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),

	toggleCategory: (categoryId) =>
		set((state) => ({
			selectedCategoryId: state.selectedCategoryId === categoryId ? null : categoryId,
		})),

	setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
});
