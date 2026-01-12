import { NextRequest } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import { removeFromWishlist } from "@/lib/domains/customers";
import { ok, notFound, badRequest } from "@/lib/api/responses";

interface RouteParams {
	params: Promise<{
		slug: string;
		customerId: string;
		productId: string;
	}>;
}

// DELETE /api/stores/[slug]/customers/[customerId]/wishlist/[productId] - Remove from wishlist
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	const { slug, customerId, productId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	try {
		const wishlist = await removeFromWishlist(store.id, customerId, productId);
		return ok({ wishlist, message: "Removed from wishlist" });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to remove from wishlist";
		return badRequest(message);
	}
}
