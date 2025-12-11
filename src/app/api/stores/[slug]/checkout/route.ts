import { NextResponse } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import {
	initiateCheckout,
	initiateCheckoutSchema,
} from "@/lib/domains/checkout";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

// POST /api/stores/[slug]/checkout - Initiate checkout
export async function POST(request: Request, { params }: RouteParams) {
	const { slug } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const body = await request.json();
	const parseResult = initiateCheckoutSchema.safeParse(body);

	if (!parseResult.success) {
		return NextResponse.json(
			{ error: "Invalid input", details: parseResult.error.flatten() },
			{ status: 400 }
		);
	}

	try {
		const session = await initiateCheckout(store.id, parseResult.data);
		return NextResponse.json({ session }, { status: 201 });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to initiate checkout";
		return NextResponse.json({ error: message }, { status: 400 });
	}
}
