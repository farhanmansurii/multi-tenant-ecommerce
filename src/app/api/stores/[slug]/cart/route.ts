import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { storeHelpers } from "@/lib/domains/stores";
import {
	getOrCreateCart,
	addItemToCart,
	clearCart,
	addToCartSchema,
} from "@/lib/domains/cart";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

// Generate or get session ID for guest carts
async function getSessionId(): Promise<string> {
	const cookieStore = await cookies();
	let sessionId = cookieStore.get("cart_session")?.value;

	if (!sessionId) {
		sessionId = crypto.randomUUID();
		// Note: Setting cookie must be done in the response
	}

	return sessionId;
}

// GET /api/stores/[slug]/cart - Get current cart
export async function GET(_request: Request, { params }: RouteParams) {
	const { slug } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const sessionId = await getSessionId();
	const cart = await getOrCreateCart(store.id, { sessionId });

	const response = NextResponse.json({ cart });

	// Set session cookie if not already set
	const cookieStore = await cookies();
	if (!cookieStore.get("cart_session")) {
		response.cookies.set("cart_session", sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 30, // 30 days
		});
	}

	return response;
}

// POST /api/stores/[slug]/cart - Add item to cart
export async function POST(request: Request, { params }: RouteParams) {
	const { slug } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const body = await request.json();
	const parseResult = addToCartSchema.safeParse(body);

	if (!parseResult.success) {
		return NextResponse.json(
			{ error: "Invalid input", details: parseResult.error.flatten() },
			{ status: 400 }
		);
	}

	const sessionId = await getSessionId();
	const cart = await getOrCreateCart(store.id, { sessionId });

	try {
		const item = await addItemToCart(store.id, cart.id, parseResult.data);

		const response = NextResponse.json({ item, cartId: cart.id }, { status: 201 });

		// Ensure session cookie is set
		const cookieStore = await cookies();
		if (!cookieStore.get("cart_session")) {
			response.cookies.set("cart_session", sessionId, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 60 * 60 * 24 * 30,
			});
		}

		return response;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to add item";
		return NextResponse.json({ error: message }, { status: 400 });
	}
}

// DELETE /api/stores/[slug]/cart - Clear cart
export async function DELETE(_request: Request, { params }: RouteParams) {
	const { slug } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const sessionId = await getSessionId();
	const cart = await getOrCreateCart(store.id, { sessionId });

	await clearCart(store.id, cart.id);

	return NextResponse.json({ success: true });
}
