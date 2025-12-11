import { NextResponse } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import {
	updateCartItem,
	removeCartItem,
	updateCartItemSchema,
} from "@/lib/domains/cart";

interface RouteParams {
	params: Promise<{
		slug: string;
		itemId: string;
	}>;
}

// PATCH /api/stores/[slug]/cart/items/[itemId] - Update item quantity
export async function PATCH(request: Request, { params }: RouteParams) {
	const { slug, itemId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const body = await request.json();
	const parseResult = updateCartItemSchema.safeParse(body);

	if (!parseResult.success) {
		return NextResponse.json(
			{ error: "Invalid input", details: parseResult.error.flatten() },
			{ status: 400 }
		);
	}

	const item = await updateCartItem(store.id, itemId, parseResult.data);

	if (!item) {
		return NextResponse.json({ error: "Item not found" }, { status: 404 });
	}

	return NextResponse.json({ item });
}

// DELETE /api/stores/[slug]/cart/items/[itemId] - Remove item from cart
export async function DELETE(_request: Request, { params }: RouteParams) {
	const { slug, itemId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const success = await removeCartItem(store.id, itemId);

	if (!success) {
		return NextResponse.json({ error: "Item not found" }, { status: 404 });
	}

	return NextResponse.json({ success: true });
}
