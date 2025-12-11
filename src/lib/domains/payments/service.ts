import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema/ecommerce/payments";
import { orders } from "@/lib/db/schema/ecommerce/orders";
import type { Payment, PaymentStatus, PaymentMethod } from "./types";
import type { CreatePaymentInput } from "./validation";

// Create payment record
export async function createPayment(
	storeId: string,
	input: CreatePaymentInput
): Promise<Payment> {
	const paymentId = createId();
	const transactionId = `txn_${createId()}`;

	// Verify order exists
	const order = await db
		.select({ id: orders.id })
		.from(orders)
		.where(and(eq(orders.id, input.orderId), eq(orders.storeId, storeId)))
		.limit(1);

	if (order.length === 0) {
		throw new Error("Order not found");
	}

	await db.insert(payments).values({
		id: paymentId,
		storeId,
		orderId: input.orderId,
		amountCents: input.amountCents,
		currency: input.currency || "INR",
		method: input.method as PaymentMethod,
		status: "pending",
		transactionId,
		gatewayResponse: { gateway: "mock" },
	});

	return getPaymentById(storeId, paymentId) as Promise<Payment>;
}

// Get payment by ID
export async function getPaymentById(storeId: string, paymentId: string): Promise<Payment | null> {
	const result = await db
		.select()
		.from(payments)
		.where(and(eq(payments.id, paymentId), eq(payments.storeId, storeId)))
		.limit(1);

	if (result.length === 0) return null;

	const payment = result[0];
	return {
		id: payment.id,
		storeId: payment.storeId,
		orderId: payment.orderId,
		amountCents: payment.amountCents,
		currency: payment.currency,
		method: payment.method,
		status: payment.status,
		transactionId: payment.transactionId,
		gatewayResponse: (payment.gatewayResponse as Payment["gatewayResponse"]) || { gateway: "mock" },
		createdAt: payment.createdAt,
	};
}

// Get payments for an order
export async function getPaymentsByOrder(storeId: string, orderId: string): Promise<Payment[]> {
	const result = await db
		.select()
		.from(payments)
		.where(and(eq(payments.orderId, orderId), eq(payments.storeId, storeId)));

	return result.map((payment) => ({
		id: payment.id,
		storeId: payment.storeId,
		orderId: payment.orderId,
		amountCents: payment.amountCents,
		currency: payment.currency,
		method: payment.method,
		status: payment.status,
		transactionId: payment.transactionId,
		gatewayResponse: (payment.gatewayResponse as Payment["gatewayResponse"]) || { gateway: "mock" },
		createdAt: payment.createdAt,
	}));
}

// Process mock payment (simulates payment processing)
export async function processMockPayment(
	storeId: string,
	paymentId: string
): Promise<{ success: boolean; status: PaymentStatus }> {
	// Simulate processing delay
	await new Promise((resolve) => setTimeout(resolve, 100));

	// 95% success rate for mock payments
	const success = Math.random() > 0.05;
	const status: PaymentStatus = success ? "succeeded" : "failed";

	await db
		.update(payments)
		.set({
			status,
			gatewayResponse: {
				gateway: "mock",
				gatewayTransactionId: `mock_${createId()}`,
				gatewayResponse: { success, processedAt: new Date().toISOString() },
			},
		})
		.where(and(eq(payments.id, paymentId), eq(payments.storeId, storeId)));

	return { success, status };
}

// Update payment status
export async function updatePaymentStatus(
	storeId: string,
	paymentId: string,
	status: PaymentStatus
): Promise<Payment | null> {
	const result = await db
		.update(payments)
		.set({ status })
		.where(and(eq(payments.id, paymentId), eq(payments.storeId, storeId)))
		.returning();

	if (result.length === 0) return null;

	return getPaymentById(storeId, paymentId);
}
