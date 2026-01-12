import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { discounts } from "@/lib/db/schema/ecommerce/discounts";
import { storeHelpers } from "@/lib/domains/stores";
import { ok, notFound, badRequest, serverError } from "@/lib/api/responses";
import { logger } from "@/lib/api/logger";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	try {
		const { code, cartTotal } = await request.json();

		if (!code) {
			return badRequest("Discount code is required");
		}

		const [discountRecord] = await db
			.select()
			.from(discounts)
			.where(
				and(
					eq(discounts.storeId, store.id),
					eq(discounts.code, code.toUpperCase()),
					eq(discounts.isActive, true)
				)
			);

		if (!discountRecord) {
			return notFound("Invalid discount code");
		}

		const now = new Date();
		const startsAt = discountRecord.startsAt ? new Date(discountRecord.startsAt) : null;
		const expiresAt = discountRecord.expiresAt ? new Date(discountRecord.expiresAt) : null;

		if (startsAt && startsAt > now) {
			return badRequest("Discount code is not yet active");
		}

		if (expiresAt && expiresAt < now) {
			return badRequest("Discount code has expired");
		}

		if (discountRecord.usageLimit && discountRecord.usedCount >= discountRecord.usageLimit) {
			return badRequest("Discount usage limit reached");
		}

		if (discountRecord.minOrderAmount && cartTotal < discountRecord.minOrderAmount) {
			return badRequest(
				`Minimum order amount of ${(discountRecord.minOrderAmount / 100).toFixed(2)} required`
			);
		}

		let discountAmount = 0;
		if (discountRecord.type === "percentage") {
			discountAmount = Math.round(cartTotal * (discountRecord.value / 100));
			if (discountRecord.maxDiscountAmount) {
				discountAmount = Math.min(discountAmount, discountRecord.maxDiscountAmount);
			}
		} else {
			discountAmount = Math.min(discountRecord.value, cartTotal);
		}

		return ok({
			code: discountRecord.code,
			amount: discountAmount,
			type: discountRecord.type,
			value: discountRecord.value,
		});
	} catch (error) {
		logger.error("Failed to verify discount", error, { slug, code });
		return serverError("Failed to verify discount");
	}
}
