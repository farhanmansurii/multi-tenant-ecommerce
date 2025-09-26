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

export type StorefrontState = CartSlice & StorefrontSessionSlice;
