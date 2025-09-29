export type CartItem = {
	id: string;
	productId: string;
	name: string;
	price: number;
	quantity: number;
	image?: string | null;
	variantId?: string | null;
	metadata?: Record<string, unknown>;
};

export type CartSummary = {
	items: CartItem[];
	subtotal: number;
	totalQuantity: number;
};

export interface CartSlice {
	cart: CartSummary;
	addItem: (item: CartItem) => void;
	updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
	removeItem: (productId: string, variantId?: string | null) => void;
	clearCart: () => void;
	hydrateCart: (items: CartItem[]) => void;
}

export interface StorefrontSessionSlice {
	storeSlug: string | null;
	selectedCategoryId: string | null;
	isCartOpen: boolean;
	setStoreSlug: (slug: string | null) => void;
	setSelectedCategoryId: (categoryId: string | null) => void;
	toggleCategory: (categoryId: string) => void;
	setCartOpen: (isOpen: boolean) => void;
}

export type StorefrontWishlistItem = {
	id: string;
	storeSlug: string;
	productId: string;
	productSlug: string;
	name: string;
	price: number;
	image?: string | null;
	addedAt: string;
};

export type StorefrontAddress = {
	id: string;
	storeSlug: string;
	label: string;
	recipient: string;
	line1: string;
	line2?: string | null;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	isDefault?: boolean;
};

export type StorefrontOrderStatus =
	| 'processing'
	| 'fulfilled'
	| 'shipped'
	| 'delivered'
	| 'cancelled';

export type StorefrontOrder = {
	id: string;
	orderNumber: string;
	storeSlug: string;
	status: StorefrontOrderStatus;
	totalAmount: number;
	currency: string;
	items: number;
	placedAt: string;
};

export type StorefrontCustomerRole = 'storefront_customer';

export interface StorefrontCustomerProfile {
	id: string;
	storeSlug: string;
	role: StorefrontCustomerRole;
	name?: string | null;
	email?: string | null;
	avatarUrl?: string | null;
	wishlist: StorefrontWishlistItem[];
	savedAddresses: StorefrontAddress[];
	orders: StorefrontOrder[];
	createdAt: string;
	updatedAt: string;
}

export interface StorefrontCustomerSlice {
	customerProfile: StorefrontCustomerProfile | null;
	authRole: StorefrontCustomerRole | null;
	syncCustomerSession: (params: {
		storeSlug: string;
		user: { id: string; name?: string | null; email?: string | null; image?: string | null };
	}) => void;
	setCustomerProfile: (profile: StorefrontCustomerProfile | null) => void;
	setAuthRole: (role: StorefrontCustomerRole | null) => void;
	updateCustomerProfile: (
		updates: Partial<
			Omit<
				StorefrontCustomerProfile,
				'wishlist' | 'savedAddresses' | 'orders' | 'storeSlug' | 'role' | 'id'
			>
		>
	) => void;
	addWishlistItem: (item: StorefrontWishlistItem) => void;
	removeWishlistItem: (productSlug: string) => void;
	clearWishlist: () => void;
	upsertAddress: (address: StorefrontAddress) => void;
	removeAddress: (addressId: string) => void;
	recordOrder: (order: StorefrontOrder) => void;
	clearCustomerData: () => void;
}

export type StorefrontState = CartSlice & StorefrontSessionSlice & StorefrontCustomerSlice;
