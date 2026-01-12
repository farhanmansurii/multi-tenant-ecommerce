import { NextRequest } from "next/server";

import { getApiContextOrNull } from "@/lib/api/context";
import {
	initiateCheckout,
	initiateCheckoutSchema,
} from "@/lib/domains/checkout";
import { created, notFound, badRequest } from "@/lib/api/responses";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

// POST /api/stores/[slug]/checkout - Initiate checkout
export async function POST(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await getApiContextOrNull(request, slug);
	if (ctx instanceof Response) return ctx;
	if (!ctx) return notFound("Store not found");

	const body = await request.json();
	const parseResult = initiateCheckoutSchema.safeParse(body);

	if (!parseResult.success) {
		return badRequest("Invalid input");
	}

	try {
		const session = await initiateCheckout(ctx.storeId, parseResult.data);
		return created({ session });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to initiate checkout";
		return badRequest(message);
	}
}
