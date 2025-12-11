import { NextResponse } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import {
	getWishlist,
	addToWishlist,
	addToWishlistSchema,
} from "@/lib/domains/customers";

interface RouteParams {
	params: Promise<{
		slug: string;
		customerId: string;
	}>;
}

// GET /api/stores/[slug]/customers/[customerId]/wishlist - Get wishlist
export async function GET(_request: Request, { params }: RouteParams) {
	const { slug, customerId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	try {
		const wishlist = await getWishlist(store.id, customerId);
		return NextResponse.json({ wishlist });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to get wishlist";
		return NextResponse.json({ error: message }, { status: 404 });
	}
}

// POST /api/stores/[slug]/customers/[customerId]/wishlist - Add to wishlist
export async function POST(request: Request, { params }: RouteParams) {
	const { slug, customerId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const body = await request.json();
	const parseResult = addToWishlistSchema.safeParse(body);

	if (!parseResult.success) {
		return NextResponse.json(
			{ error: "Invalid input", details: parseResult.error.flatten() },
			{ status: 400 }
		);
	}

	try {
		const wishlist = await addToWishlist(store.id, customerId, parseResult.data);
		return NextResponse.json({ wishlist }, { status: 201 });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to add to wishlist";
		return NextResponse.json({ error: message }, { status: 400 });
	}
}
