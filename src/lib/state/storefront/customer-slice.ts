import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';

import type {
	StorefrontState,
	StorefrontCustomerSlice,
	StorefrontAddress,
	StorefrontCustomerProfile,
	StorefrontOrder,
	StorefrontWishlistItem,
} from './types';

const nowIso = () => new Date().toISOString();

const ensureStoreMatch = (profile: StorefrontCustomerProfile | null, storeSlug: string) =>
	profile && profile.storeSlug === storeSlug ? profile : null;

export const createCustomerSlice: StateCreator<StorefrontState, [], [], StorefrontCustomerSlice> = (
	set
) => ({
	customerProfile: null,
	authRole: null,

	syncCustomerSession: ({ storeSlug, user }) => {
		set((state) => {
			const existing = ensureStoreMatch(state.customerProfile, storeSlug);
			const baseTimestamp = nowIso();

			const updatedProfile: StorefrontCustomerProfile = {
				id: user.id,
				storeSlug,
				role: 'storefront_customer',
				name: user.name ?? existing?.name ?? null,
				email: user.email ?? existing?.email ?? null,
				avatarUrl: (user.image as string | undefined | null) ?? existing?.avatarUrl ?? null,
				wishlist: existing?.wishlist ?? [],
				savedAddresses: existing?.savedAddresses ?? [],
				orders: existing?.orders ?? [],
				createdAt: existing?.createdAt ?? baseTimestamp,
				updatedAt: baseTimestamp,
			};

			return { customerProfile: updatedProfile };
		});
	},

	setAuthRole: (role) => {
		set({ authRole: role });
	},

	setCustomerProfile: (profile) => {
		set({ customerProfile: profile, authRole: profile?.role ?? null });
	},

	updateCustomerProfile: (updates) => {
		set((state) => {
			if (!state.customerProfile) return state;
			return {
				customerProfile: {
					...state.customerProfile,
					...updates,
					updatedAt: nowIso(),
				},
			};
		});
	},

	addWishlistItem: (item: StorefrontWishlistItem) => {
		set((state) => {
			const profile = state.customerProfile;
			if (!profile || profile.storeSlug !== item.storeSlug) return state;
			const exists = profile.wishlist.some(
				(entry) =>
					entry.productId === item.productId || entry.productSlug === item.productSlug
			);
			if (exists) return state;
			return {
				customerProfile: {
					...profile,
					wishlist: [
						...profile.wishlist,
						{ ...item, addedAt: item.addedAt ?? nowIso(), id: item.id || nanoid() },
					],
					updatedAt: nowIso(),
				},
			};
		});
	},

	removeWishlistItem: (productSlug: string) => {
		set((state) => {
			const profile = state.customerProfile;
			if (!profile) return state;
			return {
				customerProfile: {
					...profile,
					wishlist: profile.wishlist.filter((item) => item.productSlug !== productSlug),
					updatedAt: nowIso(),
				},
			};
		});
	},

	clearWishlist: () => {
		set((state) => {
			const profile = state.customerProfile;
			if (!profile) return state;
			return {
				customerProfile: {
					...profile,
					wishlist: [],
					updatedAt: nowIso(),
				},
			};
		});
	},

	upsertAddress: (address: StorefrontAddress) => {
		set((state) => {
			const profile = state.customerProfile;
			if (!profile || profile.storeSlug !== address.storeSlug) return state;

			const addressId = address.id || nanoid();
			const nextAddresses = profile.savedAddresses.some((entry) => entry.id === addressId)
				? profile.savedAddresses.map((entry) =>
						entry.id === addressId ? { ...entry, ...address, id: addressId } : entry
					)
				: [...profile.savedAddresses, { ...address, id: addressId }];

			return {
				customerProfile: {
					...profile,
					savedAddresses: nextAddresses,
					updatedAt: nowIso(),
				},
			};
		});
	},

	removeAddress: (addressId) => {
		set((state) => {
			const profile = state.customerProfile;
			if (!profile) return state;
			return {
				customerProfile: {
					...profile,
					savedAddresses: profile.savedAddresses.filter(
						(address) => address.id !== addressId
					),
					updatedAt: nowIso(),
				},
			};
		});
	},

	recordOrder: (order: StorefrontOrder) => {
		set((state) => {
			const profile = state.customerProfile;
			if (!profile || profile.storeSlug !== order.storeSlug) return state;
			const nextOrder: StorefrontOrder = {
				...order,
				id: order.id || nanoid(),
				placedAt: order.placedAt ?? nowIso(),
			};

			return {
				customerProfile: {
					...profile,
					orders: [nextOrder, ...profile.orders],
					updatedAt: nowIso(),
				},
			};
		});
	},

	clearCustomerData: () => {
		set({ customerProfile: null, authRole: null });
	},
});
