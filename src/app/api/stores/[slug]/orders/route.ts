import type { NextRequest } from "next/server";

import {
	listOrders,
	createOrder,
} from "@/lib/domains/orders";
import { getCustomerByUserId } from "@/lib/domains/customers";
import { getApiContextOrNull } from "@/lib/api/context";
import { ok, created, badRequest, notFound } from "@/lib/api/responses";
import { parseJson, parseQuery } from "@/lib/api/validation";
import { createStoreOrderBodySchema, orderListQuerySchema } from "@/lib/schemas/order";
import { CACHE_CONFIG } from "@/lib/api/cache-config";
import { revalidateOrderCache } from "@/lib/api/cache-revalidation";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

// GET /api/stores/[slug]/orders - List orders with pagination
export async function GET(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await getApiContextOrNull(request, slug);
	if (ctx instanceof Response) return ctx;
	if (!ctx) return notFound("Store not found");

	const query = parseQuery(request, orderListQuerySchema);
	if (query instanceof Response) return query;
	const page = query.page ?? 1;
	const limit = query.limit ?? 20;

	const queryUserId = query.userId;
	let customerId = query.customerId;
	if (queryUserId && !customerId) {
		const customer = await getCustomerByUserId(ctx.storeId, queryUserId);
		if (customer) {
			customerId = customer.id;
		} else {
			const response = ok(
				{
					orders: [],
					total: 0,
					page: 1,
					limit: 20,
					totalPages: 0,
				},
				{
					headers: {
						"Cache-Control": CACHE_CONFIG.ORDERS.cacheControl,
					},
				},
			);
			response.headers.set("Cache-Tag", CACHE_CONFIG.ORDERS.tags(slug).join(", "));
			return response;
		}
	}

	const queryParams = {
		page,
		limit,
		status: query.status,
		customerId,
	};

	const result = await listOrders(ctx.storeId, queryParams);

	const response = ok(
		{
			orders: result.orders,
			total: result.total,
			page: queryParams.page,
			limit: queryParams.limit,
			totalPages: Math.ceil(result.total / queryParams.limit),
		},
		{
			headers: {
				"Cache-Control": CACHE_CONFIG.ORDERS.cacheControl,
			},
		},
	);
	response.headers.set("Cache-Tag", CACHE_CONFIG.ORDERS.tags(slug).join(", "));
	return response;
}

// POST /api/stores/[slug]/orders - Create order from cart
export async function POST(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await getApiContextOrNull(request, slug);
	if (ctx instanceof Response) return ctx;
	if (!ctx) return notFound("Store not found");

	const body = await parseJson(request, createStoreOrderBodySchema);
	if (body instanceof Response) return body;

	try {
		const order = await createOrder(ctx.storeId, body);
		revalidateOrderCache(slug);
		return created(
			{ order },
			{
				headers: {
					"Cache-Control": CACHE_CONFIG.MUTATION.cacheControl,
				},
			},
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create order";
		return badRequest(message);
	}
}
