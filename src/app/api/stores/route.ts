import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { eq, count, sql, inArray } from "drizzle-orm";

import { requireAuthOrNull } from "@/lib/session-helpers";
import { db } from "@/lib/db";
import { stores, products } from "@/lib/db/schema";
import { storeSchema } from "@/lib/validations/store";

const MAX_STORES_PER_USER = 3;

export async function POST(request: Request) {
	const session = await requireAuthOrNull();

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// Check if user has reached the store limit
		const [storeCount] = await db
			.select({ count: count() })
			.from(stores)
			.where(eq(stores.ownerId, session.user.id));

		if (storeCount.count >= MAX_STORES_PER_USER) {
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

		const [createdStore] = await db
			.insert(stores)
			.values({
				id: crypto.randomUUID(),
				ownerId: session.user.id,
				name: data.storeName,
				slug: data.storeSlug,
				tagline: data.tagline ?? null,
				description: data.description,
				contactEmail: data.email,
				contactPhone: data.phone || null,
				website: data.website || null,
				businessType: data.businessType,
				businessName: data.businessName,
				taxId: data.taxId || null,
				addressLine1: data.address,
				city: data.city,
				state: data.state,
				zipCode: data.zipCode,
				country: data.country,
				logo: data.logo || null,
				favicon: data.favicon || null,
				primaryColor: data.primaryColor,
				secondaryColor: data.secondaryColor || null,
				currency: data.currency,
				timezone: data.timezone,
				language: data.language,
				paymentMethods: data.paymentMethods,
				shippingEnabled: data.shippingEnabled,
				freeShippingThreshold:
					data.freeShippingThreshold !== undefined && data.freeShippingThreshold !== null
						? data.freeShippingThreshold.toString()
						: null,
				shippingRates: data.shippingRates ?? [],
				termsOfService: data.termsOfService,
				privacyPolicy: data.privacyPolicy,
				refundPolicy: data.refundPolicy,
				status: data.status,
				featured: data.featured,
			})
			.returning();

		return NextResponse.json(
			{ store: createdStore },
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{
					error: "Invalid payload",
					details: error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		console.error("Failed to create store", error);
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
		// Get stores
		const userStores = await db
			.select()
			.from(stores)
			.where(eq(stores.ownerId, session.user.id));

		const storeIds = userStores.map(store => store.id);
		const productCounts = storeIds.length > 0 ? await db
			.select({
				storeId: products.storeId,
				count: sql<number>`COUNT(*)::int`.as('count')
			})
			.from(products)
			.where(inArray(products.storeId, storeIds))
			.groupBy(products.storeId) : [];

		const productCountMap = new Map(
			productCounts.map(pc => [pc.storeId, pc.count])
		);

		const storesWithCounts = userStores.map(store => ({
			...store,
			productCount: productCountMap.get(store.id) || 0
		}));

		return NextResponse.json({
			stores: storesWithCounts,
			count: userStores.length,
			limit: MAX_STORES_PER_USER,
			canCreateMore: userStores.length < MAX_STORES_PER_USER
		});
	} catch (error) {
		console.error("Failed to fetch stores", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
