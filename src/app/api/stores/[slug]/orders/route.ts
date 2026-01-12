import { NextRequest } from "next/server";

import {
	listOrders,
	createOrder,
	createOrderSchema,
	orderQuerySchema,
} from "@/lib/domains/orders";
import { getCustomerByUserId } from "@/lib/domains/customers";
import { withStoreContext } from "@/lib/api/handlers";
import { ok, created, badRequest, forbidden } from "@/lib/api/responses";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

// GET /api/stores/[slug]/orders - List orders with pagination
export async function GET(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await withStoreContext<{ storeId: string; userId?: string; store: any }>(
		request,
		slug,
		undefined,
		{ getSession: true }
	);
	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;
	const { storeId, userId: sessionUserId, store } = ctx as { storeId: string; userId?: string; store: any };

	// Parse query params
	const url = new URL(request.url);
	const queryUserId = url.searchParams.get("userId") || undefined;
	let customerId = url.searchParams.get("customerId") || undefined;

	// Permission Check
	const isOwner = sessionUserId === store.ownerUserId;
	const isCustomerViewingOwn = sessionUserId && queryUserId === sessionUserId;

	if (!isOwner && !isCustomerViewingOwn) {
		return forbidden("You do not have permission to view these orders");
	}

	// If userId is provided, lookup the customer by userId first
	if (queryUserId && !customerId) {
		const customer = await getCustomerByUserId(storeId, queryUserId);
		if (customer) {
			customerId = customer.id;
		} else {
			// No customer found for this user, return empty
			return ok({
				orders: [],
				total: 0,
				page: 1,
				limit: 20,
				totalPages: 0,
			});
		}
	}

	const queryParams = {
		page: url.searchParams.get("page") || "1",
		limit: url.searchParams.get("limit") || "20",
		status: url.searchParams.get("status") || undefined,
		customerId,
	};

	const parseResult = orderQuerySchema.safeParse(queryParams);
	if (!parseResult.success) {
		return badRequest("Invalid query parameters");
	}

	const result = await listOrders(storeId, parseResult.data);

	return ok({
		orders: result.orders,
		total: result.total,
		page: parseResult.data.page,
		limit: parseResult.data.limit,
		totalPages: Math.ceil(result.total / parseResult.data.limit),
	});
}

// POST /api/stores/[slug]/orders - Create order from cart
export async function POST(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await withStoreContext<{ storeId: string }>(request, slug);
	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;
	const { storeId } = ctx as { storeId: string };

	const body = await request.json();
	const parseResult = createOrderSchema.safeParse(body);

	if (!parseResult.success) {
		return badRequest("Invalid input");
	}

	try {
		const order = await createOrder(storeId, parseResult.data);
		return created({ order });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create order";
		return badRequest(message);
	}
}
