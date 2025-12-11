export type CartStatus = "active" | "abandoned" | "converted" | "expired";

export interface CartItem {
	id: string;
	cartId: string;
	storeId: string;
	productId: string;
	variantId: string | null;
	qty: number;
	unitPriceCents: number;
	createdAt: Date;
	updatedAt: Date;
	// Populated fields
	product?: {
		id: string;
		name: string;
		slug: string;
		images: Array<{ url: string; alt: string }>;
	};
	variant?: {
		id: string;
		sku: string;
		attributes: Record<string, string>;
	};
}

export interface Cart {
	id: string;
	storeId: string;
	customerId: string | null;
	sessionId: string | null;
	status: CartStatus;
	currency: string;
	createdAt: Date;
	updatedAt: Date;
	items: CartItem[];
	// Computed fields
	subtotalCents: number;
	itemCount: number;
}

export interface CartSummary {
	id: string;
	itemCount: number;
	subtotalCents: number;
	currency: string;
}
