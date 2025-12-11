import type { Order } from "@/lib/domains/orders/types";
import type { Cart } from "@/lib/domains/cart/types";

export type CheckoutStatus = "pending" | "processing" | "completed" | "failed";

export interface CheckoutSession {
	orderId: string;
	orderNumber: number;
	status: CheckoutStatus;
	cart: Cart;
	amounts: {
		subtotal: number;
		tax: number;
		shipping: number;
		discount: number;
		total: number;
	};
	currency: string;
}

export interface CheckoutResult {
	success: boolean;
	order: Order;
	paymentStatus: "succeeded" | "pending" | "failed";
	message: string;
}
