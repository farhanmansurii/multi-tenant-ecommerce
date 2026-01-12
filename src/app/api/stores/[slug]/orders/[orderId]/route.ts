import { NextRequest } from "next/server";

import { getApiContextOrNull } from "@/lib/api/context";
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
export async function GET(request: NextRequest, { params }: RouteParams) {
	const { slug, orderId } = await params;

	const ctx = await getApiContextOrNull(request, slug);
	if (ctx instanceof Response) return ctx;
	if (!ctx) return notFound("Store not found");

	const order = await getOrderById(ctx.storeId, orderId);

	if (!order) {
		return notFound("Order not found");
	}

	return ok({ order });
}

// PATCH /api/stores/[slug]/orders/[orderId] - Update order status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const { slug, orderId } = await params;

	const ctx = await getApiContextOrNull(request, slug);
	if (ctx instanceof Response) return ctx;
	if (!ctx) return notFound("Store not found");

	const body = await request.json();
	const parseResult = updateOrderStatusSchema.safeParse(body);

	if (!parseResult.success) {
		return badRequest("Invalid input");
	}

	const order = await updateOrderStatus(ctx.storeId, orderId, parseResult.data.status);

	if (!order) {
		return notFound("Order not found");
	}

	return ok({ order });
}

// DELETE /api/stores/[slug]/orders/[orderId] - Cancel order
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const { slug, orderId } = await params;

	const ctx = await getApiContextOrNull(request, slug);
	if (ctx instanceof Response) return ctx;
	if (!ctx) return notFound("Store not found");

	const success = await cancelOrder(ctx.storeId, orderId);

	if (!success) {
		return badRequest("Order not found or cannot be cancelled");
	}

	return ok({ success: true, message: "Order cancelled" });
}
