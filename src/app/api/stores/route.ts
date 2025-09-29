import { NextResponse } from "next/server";


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
	const session = await requireAuthOrNull();

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// Get stores
		const userStores = await storeHelpers.getStoresByOwner(session.user.id);

		return NextResponse.json({
			stores: userStores,
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
