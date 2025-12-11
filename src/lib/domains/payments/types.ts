export type PaymentMethod = "stripe" | "paypal" | "upi" | "cod" | "bank_transfer";
export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "cancelled" | "refunded" | "partially_refunded";

export interface GatewayResponse {
	gateway: string;
	gatewayTransactionId?: string;
	gatewayResponse?: Record<string, unknown>;
	error?: string;
}

export interface Payment {
	id: string;
	storeId: string;
	orderId: string;
	amountCents: number;
	currency: string;
	method: PaymentMethod;
	status: PaymentStatus;
	transactionId: string | null;
	gatewayResponse: GatewayResponse;
	createdAt: Date;
}
