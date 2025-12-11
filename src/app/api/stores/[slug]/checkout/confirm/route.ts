import { NextResponse } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import {
	confirmCheckout,
	confirmCheckoutSchema,
} from "@/lib/domains/checkout";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

// POST /api/stores/[slug]/checkout/confirm - Confirm checkout and process payment
export async function POST(request: Request, { params }: RouteParams) {
	const { slug } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const body = await request.json();
	const parseResult = confirmCheckoutSchema.safeParse(body);

	if (!parseResult.success) {
		return NextResponse.json(
			{ error: "Invalid input", details: parseResult.error.flatten() },
			{ status: 400 }
		);
	}

	try {
		const result = await confirmCheckout(store.id, parseResult.data);

		if (result.success) {
			return NextResponse.json({
				success: true,
				order: result.order,
				paymentStatus: result.paymentStatus,
				message: result.message,
			});
		} else {
			return NextResponse.json({
				success: false,
				order: result.order,
				paymentStatus: result.paymentStatus,
				message: result.message,
			}, { status: 402 }); // Payment Required
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to confirm checkout";
		return NextResponse.json({ error: message }, { status: 400 });
	}
}
