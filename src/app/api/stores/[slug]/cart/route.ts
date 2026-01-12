import { NextRequest } from "next/server";
import { cookies } from "next/headers";

import { getApiContextOrNull } from "@/lib/api/context";
import {
	getOrCreateCart,
	addItemToCart,
	clearCart,
	addToCartSchema,
} from "@/lib/domains/cart";
import { ok, created, notFound, badRequest } from "@/lib/api/responses";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

// Generate or get session ID for guest carts (store-specific)
async function getSessionId(storeSlug: string): Promise<string> {
	const cookieStore = await cookies();
	const cookieName = `cart_session_${storeSlug}`;
	let sessionId = cookieStore.get(cookieName)?.value;

	if (!sessionId) {
		sessionId = crypto.randomUUID();
		// Note: Setting cookie must be done in the response
	}

	return sessionId;
}

// GET /api/stores/[slug]/cart - Get current cart
export async function GET(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await getApiContextOrNull(request, slug);
	if (ctx instanceof Response) return ctx;
	if (!ctx) return notFound("Store not found");

	const sessionId = await getSessionId(slug);
	const cart = await getOrCreateCart(ctx.storeId, { sessionId });

	const response = ok(
		{ cart },
		{
			headers: {
				'Cache-Control': 'private, no-cache, no-store, must-revalidate',
			},
		}
	);

	// Set session cookie if not already set (store-specific)
	const cookieStore = await cookies();
	const cookieName = `cart_session_${slug}`;
	if (!cookieStore.get(cookieName)) {
		response.cookies.set(cookieName, sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 30, // 30 days
		});
	}

	return response;
}

// POST /api/stores/[slug]/cart - Add item to cart
export async function POST(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await getApiContextOrNull(request, slug);
	if (ctx instanceof Response) return ctx;
	if (!ctx) return notFound("Store not found");

	const body = await request.json();
	const parseResult = addToCartSchema.safeParse(body);

	if (!parseResult.success) {
		return badRequest("Invalid input");
	}

	const sessionId = await getSessionId(slug);
	const cart = await getOrCreateCart(ctx.storeId, { sessionId });

	try {
		const item = await addItemToCart(ctx.storeId, cart.id, parseResult.data);

		const response = created({ item, cartId: cart.id });

		// Ensure session cookie is set (store-specific)
		const cookieStore = await cookies();
		const cookieName = `cart_session_${slug}`;
		if (!cookieStore.get(cookieName)) {
			response.cookies.set(cookieName, sessionId, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 60 * 60 * 24 * 30,
			});
		}

		return response;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to add item";
		return badRequest(message);
	}
}

// DELETE /api/stores/[slug]/cart - Clear cart
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await getApiContextOrNull(request, slug);
	if (ctx instanceof Response) return ctx;
	if (!ctx) return notFound("Store not found");

	const sessionId = await getSessionId(slug);
	const cart = await getOrCreateCart(ctx.storeId, { sessionId });

	await clearCart(ctx.storeId, cart.id);

	return ok({ success: true });
}
