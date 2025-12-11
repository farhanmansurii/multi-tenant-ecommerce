import { createOrder, getOrderById, updateOrderStatus } from "@/lib/domains/orders";
import { getCartById, markCartAsConverted } from "@/lib/domains/cart";
import type { CheckoutSession, CheckoutResult } from "./types";
import type { InitiateCheckoutInput, ConfirmCheckoutInput } from "./validation";

// Initiate checkout - validates cart and creates pending order
export async function initiateCheckout(
	storeId: string,
	input: InitiateCheckoutInput
): Promise<CheckoutSession> {
	const { cartId, customerId, shippingAddress, billingAddress, discountCode } = input;

	// Get cart and validate
	const cart = await getCartById(storeId, cartId);
	if (!cart) {
		throw new Error("Cart not found");
	}

	if (cart.items.length === 0) {
		throw new Error("Cart is empty");
	}

	// Create pending order from cart
	const order = await createOrder(storeId, {
		cartId,
		customerId,
		shippingAddress,
		billingAddress,
		discountCode,
	});

	return {
		orderId: order.id,
		orderNumber: order.orderNumber,
		status: "pending",
		cart,
		amounts: order.amounts,
		currency: order.currency,
	};
}

// Confirm checkout - process mock payment and finalize order
export async function confirmCheckout(
	storeId: string,
	input: ConfirmCheckoutInput
): Promise<CheckoutResult> {
	const { orderId, paymentMethod } = input;

	// Get order
	const order = await getOrderById(storeId, orderId);
	if (!order) {
		throw new Error("Order not found");
	}

	if (order.status !== "pending") {
		throw new Error(`Order is already ${order.status}`);
	}

	// Mock payment processing
	const paymentSuccess = await processMockPayment(order.amounts.total, paymentMethod);

	if (paymentSuccess) {
		// Update order status to confirmed
		const updatedOrder = await updateOrderStatus(storeId, orderId, "confirmed");

		return {
			success: true,
			order: updatedOrder!,
			paymentStatus: paymentMethod === "cod" ? "pending" : "succeeded",
			message: paymentMethod === "cod"
				? "Order placed successfully. Payment will be collected on delivery."
				: "Payment successful. Order confirmed.",
		};
	} else {
		// Payment failed - keep order as pending
		return {
			success: false,
			order,
			paymentStatus: "failed",
			message: "Payment failed. Please try again.",
		};
	}
}

// Mock payment processor
async function processMockPayment(
	_amountCents: number,
	paymentMethod: string
): Promise<boolean> {
	// Simulate payment processing delay
	await new Promise((resolve) => setTimeout(resolve, 100));

	// COD always succeeds (payment collected later)
	if (paymentMethod === "cod") {
		return true;
	}

	// For mock payments, 95% success rate
	return Math.random() > 0.05;
}

// Get checkout session for an order
export async function getCheckoutSession(
	storeId: string,
	orderId: string
): Promise<CheckoutSession | null> {
	const order = await getOrderById(storeId, orderId);
	if (!order) return null;

	return {
		orderId: order.id,
		orderNumber: order.orderNumber,
		status: order.paymentStatus === "succeeded" ? "completed" : "pending",
		cart: {
			id: "",
			storeId,
			customerId: order.customerId,
			sessionId: null,
			status: "converted",
			currency: order.currency,
			createdAt: order.createdAt,
			updatedAt: order.updatedAt,
			items: [],
			subtotalCents: order.amounts.subtotal,
			itemCount: order.items.length,
		},
		amounts: order.amounts,
		currency: order.currency,
	};
}
