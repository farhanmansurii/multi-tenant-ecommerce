export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type OrderPaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "cancelled" | "refunded" | "partially_refunded";

export interface OrderAddress {
	recipient: string;
	line1: string;
	line2?: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	phone?: string;
}

export interface OrderAmounts {
	subtotal: number;
	tax: number;
	shipping: number;
	discount: number;
	total: number;
}

export interface OrderItem {
	id: string;
	storeId: string;
	orderId: string;
	productId: string;
	variantId: string | null;
	qty: number;
	unitPriceCents: number;
	totalPriceCents: number;
	createdAt: Date;
	// Populated fields
	product?: {
		id: string;
		name: string;
		slug: string;
		images: Array<{ url: string; alt: string }>;
	};
}

export interface Order {
	id: string;
	storeId: string;
	customerId: string;
	orderNumber: number;
	status: OrderStatus;
	amounts: OrderAmounts;
	currency: string;
	paymentStatus: OrderPaymentStatus;
	shippingAddress: OrderAddress;
	billingAddress: OrderAddress;
	createdAt: Date;
	updatedAt: Date;
	items: OrderItem[];
}

export interface OrderSummary {
	id: string;
	orderNumber: number;
	status: OrderStatus;
	paymentStatus: OrderPaymentStatus;
	totalAmount: number;
	currency: string;
	itemCount: number;
	createdAt: Date;
}


