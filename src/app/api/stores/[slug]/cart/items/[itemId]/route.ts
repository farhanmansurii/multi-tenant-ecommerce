import { NextRequest } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import {
	updateCartItem,
	removeCartItem,
	updateCartItemSchema,
} from "@/lib/domains/cart";
import { ok, notFound, badRequest } from "@/lib/api/responses";

interface RouteParams {
	params: Promise<{
		slug: string;
		itemId: string;
	}>;
}

// PATCH /api/stores/[slug]/cart/items/[itemId] - Update item quantity
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const { slug, itemId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	const body = await request.json();
	const parseResult = updateCartItemSchema.safeParse(body);

	if (!parseResult.success) {
		return badRequest("Invalid input");
	}

	const item = await updateCartItem(store.id, itemId, parseResult.data);

	if (!item) {
		return notFound("Item not found");
	}

	return ok({ item });
}

// DELETE /api/stores/[slug]/cart/items/[itemId] - Remove item from cart
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	const { slug, itemId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	const success = await removeCartItem(store.id, itemId);

	if (!success) {
		return notFound("Item not found");
	}

	return ok({ success: true });
}
