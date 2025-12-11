import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { orders } from "@/lib/db/schema/ecommerce/orders";
import { sql, eq, inArray, and } from "drizzle-orm";
import { storeHelpers } from "@/lib/domains/stores";
import { requireAuthOrNull } from "@/lib/session/helpers";
import { storeSchema } from "@/lib/domains/stores/validation";

const MAX_STORES_PER_USER = 3;

export async function POST(request: Request) {
	const session = await requireAuthOrNull();

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// Check if user has reached the store limit
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

		const createdStore = await storeHelpers.createStore({
			ownerUserId: session.user.id,
			name: data.storeName,
			slug: data.storeSlug,
			description: data.description,
			contactEmail: data.email,
			businessType: "retail",
			businessName: data.storeName,
			addressLine1: data.address || "",
			city: data.city || "",
			state: data.state || "",
			zipCode: data.zipCode || "",
			country: data.country || "",
			primaryColor: data.primaryColor,
			currency: data.currency,
			timezone: data.timezone,
			language: data.language,
		});

		return NextResponse.json(
			{ store: createdStore },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Failed to create store", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	console.log(">>> [/api/stores] GET called <<<");
	const session = await requireAuthOrNull();

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// Get stores
		const userStores = await storeHelpers.getStoresByOwner(session.user.id);

		const storeIds = userStores.map((s) => s.id);

		// Get product counts and revenue for all stores in parallel
		const [productCounts, storeRevenues] = await Promise.all([
			storeIds.length > 0
				? db
						.select({
							storeId: products.storeId,
							count: sql<number>`COUNT(*)::int`.as("count"),
						})
						.from(products)
						.where(inArray(products.storeId, storeIds))
						.groupBy(products.storeId)
				: [],
			storeIds.length > 0
				? db
						.select({
							storeId: orders.storeId,
							revenue: sql<number>`COALESCE(SUM((${orders.amounts}->>'total')::numeric), 0)`,
						})
						.from(orders)
						.where(inArray(orders.storeId, storeIds))
						.groupBy(orders.storeId)
				: [],
		]);

		const countMap = new Map(productCounts.map((pc) => [pc.storeId, pc.count]));
		const revenueMap = new Map(storeRevenues.map((sr) => [sr.storeId, Number(sr.revenue) || 0]));

		console.log("[stores API] storeRevenues:", storeRevenues);
		console.log("[stores API] storeIds:", storeIds);

		// Calculate totals
		const totalRevenue = storeRevenues.reduce((acc, sr) => acc + (Number(sr.revenue) || 0), 0);

		// Add product counts and revenue to stores
		const storesWithData = userStores.map((store) => ({
			...store,
			productCount: countMap.get(store.id) || 0,
			revenue: revenueMap.get(store.id) || 0,
		}));

		return NextResponse.json({
			stores: storesWithData,
			count: userStores.length,
			limit: MAX_STORES_PER_USER,
			canCreateMore: userStores.length < MAX_STORES_PER_USER,
			totalRevenue,
		});
	} catch (error) {
		console.error("Failed to fetch stores", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

