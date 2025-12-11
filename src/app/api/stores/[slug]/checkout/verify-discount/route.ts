import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { discounts } from "@/lib/db/schema/ecommerce/discounts";
import { storeHelpers } from "@/lib/domains/stores";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

export async function POST(request: Request, { params }: RouteParams) {
	const { slug } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	try {
		const { code, cartTotal } = await request.json();

		if (!code) {
			return NextResponse.json({ error: "Discount code is required" }, { status: 400 });
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
			return NextResponse.json({ error: "Invalid discount code" }, { status: 404 });
		}

		const now = new Date();
		const startsAt = discountRecord.startsAt ? new Date(discountRecord.startsAt) : null;
		const expiresAt = discountRecord.expiresAt ? new Date(discountRecord.expiresAt) : null;

		if (startsAt && startsAt > now) {
			return NextResponse.json({ error: "Discount code is not yet active" }, { status: 400 });
		}

		if (expiresAt && expiresAt < now) {
			return NextResponse.json({ error: "Discount code has expired" }, { status: 400 });
		}

		if (discountRecord.usageLimit && discountRecord.usedCount >= discountRecord.usageLimit) {
			return NextResponse.json({ error: "Discount usage limit reached" }, { status: 400 });
		}

		if (discountRecord.minOrderAmount && cartTotal < discountRecord.minOrderAmount) {
			return NextResponse.json(
				{ error: `Minimum order amount of ${(discountRecord.minOrderAmount / 100).toFixed(2)} required` },
				{ status: 400 }
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

		return NextResponse.json({
			code: discountRecord.code,
			amount: discountAmount,
			type: discountRecord.type,
			value: discountRecord.value,
		});
	} catch (error) {
		console.error("Failed to verify discount:", error);
		return NextResponse.json({ error: "Failed to verify discount" }, { status: 500 });
	}
}
