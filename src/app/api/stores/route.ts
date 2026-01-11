import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { orders } from "@/lib/db/schema/ecommerce/orders";
import { sql, inArray } from "drizzle-orm";
import { storeHelpers } from "@/lib/domains/stores";
import { requireAuthOrNull } from "@/lib/session/helpers";
import { storeSchema } from "@/lib/domains/stores/validation";
import { storeFormValuesToPayload } from "@/lib/domains/stores/form";

const MAX_STORES_PER_USER = 3;
const CACHE_DURATION = 30;

export async function POST(request: Request) {
	const session = await requireAuthOrNull();

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userStores = await storeHelpers.getStoresByOwner(session.user.id);

		if (userStores.length >= MAX_STORES_PER_USER) {
			return NextResponse.json(
				{
					error: "Store limit reached",
					message: `You can only create up to ${MAX_STORES_PER_USER} stores. Please delete an existing store to create a new one.`
				},
				{ status: 400 }
			);
		}

		const payload = await request.json();
		const data = storeSchema.parse(payload);
		const formPayload = storeFormValuesToPayload(data);

		const createdStore = await storeHelpers.createStore({
			ownerUserId: session.user.id,
			name: formPayload.storeName,
			slug: formPayload.storeSlug,
			description: formPayload.description,
			contactEmail: formPayload.email,
			businessType: formPayload.businessType,
			businessName: formPayload.businessName,
			taxId: formPayload.taxId,
			addressLine1: formPayload.address || "",
			city: formPayload.city || "",
			state: formPayload.state || "",
			zipCode: formPayload.zipCode || "",
			country: formPayload.country || "",
			primaryColor: formPayload.primaryColor,
			currency: formPayload.currency,
			timezone: formPayload.timezone,
			language: formPayload.language,
			settings: {
				paymentMethods: formPayload.paymentMethods,
				shippingRates: formPayload.shippingRates,
				upiId: formPayload.upiId,
				codEnabled: formPayload.codEnabled,
				stripeAccountId: formPayload.stripeAccountId,
				paypalEmail: formPayload.paypalEmail,
				shippingEnabled: formPayload.shippingEnabled,
				freeShippingThreshold: formPayload.freeShippingThreshold,
				termsOfService: formPayload.termsOfService,
				privacyPolicy: formPayload.privacyPolicy,
				refundPolicy: formPayload.refundPolicy,
			},
		});

		return NextResponse.json(
			{ store: createdStore },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Failed to create store", error);

		// Handle duplicate slug error specifically
		if (error instanceof Error && error.message.includes("duplicate key value violates unique constraint") && error.message.includes("stores_slug_unique")) {
			return NextResponse.json(
				{
					error: "Store URL already exists",
					message: "A store with this URL already exists. Please choose a different URL."
				},
				{ status: 409 },
			);
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	const session = await requireAuthOrNull();

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const userStores = await storeHelpers.getStoresByOwner(session.user.id);

		if (userStores.length === 0) {
			return NextResponse.json(
				{
					stores: [],
					count: 0,
					limit: MAX_STORES_PER_USER,
					canCreateMore: true,
					totalRevenue: 0,
				},
				{
					headers: {
						"Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=60`,
					},
				}
			);
		}

		const storeIds = userStores.map((s) => s.id);

		const [productCounts, storeRevenues] = await Promise.all([
			db
				.select({
					storeId: products.storeId,
					count: sql<number>`COUNT(*)::int`.as("count"),
				})
				.from(products)
				.where(inArray(products.storeId, storeIds))
				.groupBy(products.storeId),
			db
				.select({
					storeId: orders.storeId,
					revenue: sql<number>`COALESCE(SUM(((${orders.amounts}->>'total')::text)::numeric), 0)`.as("revenue"),
				})
				.from(orders)
				.where(inArray(orders.storeId, storeIds))
				.groupBy(orders.storeId),
		]);

		const countMap = new Map(productCounts.map((pc) => [pc.storeId, pc.count]));
		const revenueMap = new Map(
			storeRevenues.map((sr) => [sr.storeId, Number(sr.revenue) || 0])
		);

		const totalRevenue = storeRevenues.reduce((acc, sr) => acc + (Number(sr.revenue) || 0), 0);

		const storesWithData = userStores.map((store) => ({
			...store,
			productCount: countMap.get(store.id) || 0,
			revenue: revenueMap.get(store.id) || 0,
		}));

		return NextResponse.json(
			{
				stores: storesWithData,
				count: userStores.length,
				limit: MAX_STORES_PER_USER,
				canCreateMore: userStores.length < MAX_STORES_PER_USER,
				totalRevenue,
			},
			{
				headers: {
					"Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=60`,
				},
			}
		);
	} catch (error) {
		console.error("Failed to fetch stores", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
