import { NextRequest } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import {
	confirmCheckout,
	confirmCheckoutSchema,
} from "@/lib/domains/checkout";
import { ok, notFound, badRequest } from "@/lib/api/responses";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

// POST /api/stores/[slug]/checkout/confirm - Confirm checkout and process payment
export async function POST(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	const body = await request.json();
	const parseResult = confirmCheckoutSchema.safeParse(body);

	if (!parseResult.success) {
		return badRequest("Invalid input");
	}

	try {
		const result = await confirmCheckout(store.id, parseResult.data);

		if (result.success) {
			return ok({
				success: true,
				order: result.order,
				paymentStatus: result.paymentStatus,
				message: result.message,
			});
		} else {
			return ok({
				success: false,
				order: result.order,
				paymentStatus: result.paymentStatus,
				message: result.message,
			}, { status: 402 }); // Payment Required
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to confirm checkout";
		return badRequest(message);
	}
}
