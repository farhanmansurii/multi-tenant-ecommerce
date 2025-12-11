import { NextResponse } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import {
	getOrderById,
	updateOrderStatus,
	cancelOrder,
	updateOrderStatusSchema,
} from "@/lib/domains/orders";

interface RouteParams {
	params: Promise<{
		slug: string;
		orderId: string;
	}>;
}

// GET /api/stores/[slug]/orders/[orderId] - Get order details
export async function GET(_request: Request, { params }: RouteParams) {
	const { slug, orderId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const order = await getOrderById(store.id, orderId);

	if (!order) {
		return NextResponse.json({ error: "Order not found" }, { status: 404 });
	}

	return NextResponse.json({ order });
}

// PATCH /api/stores/[slug]/orders/[orderId] - Update order status
export async function PATCH(request: Request, { params }: RouteParams) {
	const { slug, orderId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const body = await request.json();
	const parseResult = updateOrderStatusSchema.safeParse(body);

	if (!parseResult.success) {
		return NextResponse.json(
			{ error: "Invalid input", details: parseResult.error.flatten() },
			{ status: 400 }
		);
	}

	const order = await updateOrderStatus(store.id, orderId, parseResult.data.status);

	if (!order) {
		return NextResponse.json({ error: "Order not found" }, { status: 404 });
	}

	return NextResponse.json({ order });
}

// DELETE /api/stores/[slug]/orders/[orderId] - Cancel order
export async function DELETE(_request: Request, { params }: RouteParams) {
	const { slug, orderId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const success = await cancelOrder(store.id, orderId);

	if (!success) {
		return NextResponse.json(
			{ error: "Order not found or cannot be cancelled" },
			{ status: 400 }
		);
	}

	return NextResponse.json({ success: true, message: "Order cancelled" });
}
