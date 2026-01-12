import { NextRequest } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import {
	getOrderById,
	updateOrderStatus,
	cancelOrder,
	updateOrderStatusSchema,
} from "@/lib/domains/orders";
import { ok, notFound, badRequest } from "@/lib/api/responses";

interface RouteParams {
	params: Promise<{
		slug: string;
		orderId: string;
	}>;
}

// GET /api/stores/[slug]/orders/[orderId] - Get order details
export async function GET(_request: NextRequest, { params }: RouteParams) {
	const { slug, orderId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	const order = await getOrderById(store.id, orderId);

	if (!order) {
		return notFound("Order not found");
	}

	return ok({ order });
}

// PATCH /api/stores/[slug]/orders/[orderId] - Update order status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const { slug, orderId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	const body = await request.json();
	const parseResult = updateOrderStatusSchema.safeParse(body);

	if (!parseResult.success) {
		return badRequest("Invalid input");
	}

	const order = await updateOrderStatus(store.id, orderId, parseResult.data.status);

	if (!order) {
		return notFound("Order not found");
	}

	return ok({ order });
}

// DELETE /api/stores/[slug]/orders/[orderId] - Cancel order
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	const { slug, orderId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	const success = await cancelOrder(store.id, orderId);

	if (!success) {
		return badRequest("Order not found or cannot be cancelled");
	}

	return ok({ success: true, message: "Order cancelled" });
}
