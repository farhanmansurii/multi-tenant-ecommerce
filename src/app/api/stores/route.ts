import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { orders } from "@/lib/db/schema/ecommerce/orders";
import { sql, inArray } from "drizzle-orm";
import { storeHelpers } from "@/lib/domains/stores";
import { requireAuthOrNull } from "@/lib/session/helpers";
import { storeSchema } from "@/lib/domains/stores/validation";
import { storeFormValuesToPayload } from "@/lib/domains/stores/form";
import { ok, created, unauthorized, badRequest, serverError, conflict } from "@/lib/api/responses";
import { logger } from "@/lib/api/logger";
import { parseJson } from "@/lib/api/validation";
import { CACHE_CONFIG } from "@/lib/api/cache-config";
import { revalidateStoreCache } from "@/lib/api/cache-revalidation";

const MAX_STORES_PER_USER = 3;
const CACHE_DURATION = 30;

export async function POST(request: NextRequest) {
	const session = await requireAuthOrNull();

	if (!session) {
		return unauthorized();
	}

	try {
		const userStores = await storeHelpers.getStoresByOwner(session.user.id);

		if (userStores.length >= MAX_STORES_PER_USER) {
			return badRequest(
				`You can only create up to ${MAX_STORES_PER_USER} stores. Please delete an existing store to create a new one.`
			);
		}

			const data = await parseJson(request, storeSchema);
			if (data instanceof Response) return data;
			const formPayload = storeFormValuesToPayload(data);

		const createdStore = await storeHelpers.createStore({
			ownerUserId: session.user.id,
			name: formPayload.storeName,
			slug: formPayload.storeSlug,
			description: formPayload.description,
			contactEmail: formPayload.email,
			primaryColor: formPayload.primaryColor,
			currency: formPayload.currency,
			settings: {
				paymentMethods: formPayload.paymentMethods,
				codEnabled: formPayload.codEnabled,
				shippingEnabled: formPayload.shippingEnabled,
				freeShippingThreshold: formPayload.freeShippingThreshold,
				termsOfService: formPayload.termsOfService,
				privacyPolicy: formPayload.privacyPolicy,
				refundPolicy: formPayload.refundPolicy,
			},
		});

			revalidateStoreCache(createdStore.slug);
			return created(
				{ store: createdStore },
				{
					headers: {
						"Cache-Control": CACHE_CONFIG.MUTATION.cacheControl,
					},
				}
			);
	} catch (error) {
		logger.error("Failed to create store", error, {
			userId: session.user.id,
		});

		// Handle duplicate slug error specifically
		if (error instanceof Error && error.message.includes("duplicate key value violates unique constraint") && error.message.includes("stores_slug_unique")) {
			return conflict("A store with this URL already exists. Please choose a different URL.");
		}

		return serverError();
	}
}

export async function GET() {
	const session = await requireAuthOrNull();

	if (!session) {
		return unauthorized();
	}

	try {
		const userStores = await storeHelpers.getStoresByOwner(session.user.id);

			if (userStores.length === 0) {
				const response = ok(
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
				response.headers.set("Cache-Tag", "stores");
				return response;
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

			const response = ok(
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
			response.headers.set("Cache-Tag", "stores");
			return response;
	} catch (error) {
		logger.error("Failed to fetch stores", error, {
			userId: session.user.id,
		});
		return serverError();
	}
}
