import { NextResponse } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import { removeFromWishlist } from "@/lib/domains/customers";

interface RouteParams {
	params: Promise<{
		slug: string;
		customerId: string;
		productId: string;
	}>;
}

// DELETE /api/stores/[slug]/customers/[customerId]/wishlist/[productId] - Remove from wishlist
export async function DELETE(_request: Request, { params }: RouteParams) {
	const { slug, customerId, productId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	try {
		const wishlist = await removeFromWishlist(store.id, customerId, productId);
		return NextResponse.json({ wishlist, message: "Removed from wishlist" });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to remove from wishlist";
		return NextResponse.json({ error: message }, { status: 400 });
	}
}
