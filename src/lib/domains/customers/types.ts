export interface CustomerData {
	name?: string;
	phone?: string;
	preferences?: Record<string, unknown>;
}

export interface SavedAddress {
	id: string;
	label: string;
	recipient: string;
	line1: string;
	line2?: string | null;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	isDefault?: boolean;
}

export interface WishlistItem {
	productId: string;
	productSlug: string;
	addedAt: string;
}

export interface CustomerOrderSummary {
	id: string;
	orderNumber: string;
	status: string;
	totalAmount: number;
	currency: string;
	items: number;
	placedAt: string;
}

export interface Customer {
	id: string;
	storeId: string;
	userId: string | null;
	email: string;
	data: CustomerData;
	wishlist: WishlistItem[];
	savedAddresses: SavedAddress[];
	orders: CustomerOrderSummary[];
	createdAt: Date;
	updatedAt: Date;
}

export interface CustomerSummary {
	id: string;
	email: string;
	name?: string;
	orderCount: number;
	createdAt: Date;
}


