import { NextRequest } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import {
	getWishlist,
	addToWishlist,
	addToWishlistSchema,
} from "@/lib/domains/customers";
import { ok, created, notFound, badRequest } from "@/lib/api/responses";

interface RouteParams {
	params: Promise<{
		slug: string;
		customerId: string;
	}>;
}

// GET /api/stores/[slug]/customers/[customerId]/wishlist - Get wishlist
export async function GET(_request: NextRequest, { params }: RouteParams) {
	const { slug, customerId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	try {
		const wishlist = await getWishlist(store.id, customerId);
		return ok({ wishlist });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to get wishlist";
		return notFound(message);
	}
}

// POST /api/stores/[slug]/customers/[customerId]/wishlist - Add to wishlist
export async function POST(request: NextRequest, { params }: RouteParams) {
	const { slug, customerId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	const body = await request.json();
	const parseResult = addToWishlistSchema.safeParse(body);

	if (!parseResult.success) {
		return badRequest("Invalid input");
	}

	try {
		const wishlist = await addToWishlist(store.id, customerId, parseResult.data);
		return created({ wishlist });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to add to wishlist";
		return badRequest(message);
	}
}
