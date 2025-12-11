import { NextResponse, type NextRequest } from "next/server";

import {
	listCustomers,
	createCustomer,
	getCustomerByEmail,
	createCustomerSchema,
	customerQuerySchema,
} from "@/lib/domains/customers";
import { withStoreContext } from "@/lib/api/handlers";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

// GET /api/stores/[slug]/customers - List customers with pagination (Owner Only)
export async function GET(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await withStoreContext<{ storeId: string }>(request, slug, undefined, { enforceOwner: true });
	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;
	const { storeId } = ctx as { storeId: string };

	// Parse query params
	const url = new URL(request.url);
	const queryParams = {
		page: url.searchParams.get("page") || "1",
		limit: url.searchParams.get("limit") || "20",
		search: url.searchParams.get("search") || undefined,
	};

	const parseResult = customerQuerySchema.safeParse(queryParams);
	if (!parseResult.success) {
		return NextResponse.json(
			{ error: "Invalid query parameters", details: parseResult.error.flatten() },
			{ status: 400 }
		);
	}

	const result = await listCustomers(storeId, parseResult.data);

	return NextResponse.json({
		customers: result.customers,
		total: result.total,
		page: parseResult.data.page,
		limit: parseResult.data.limit,
		totalPages: Math.ceil(result.total / parseResult.data.limit),
	});
}

// POST /api/stores/[slug]/customers - Create customer (Public)
export async function POST(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	// Public access for customer creation (signup/checkout)
	const ctx = await withStoreContext<{ storeId: string }>(request, slug);
	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;
	const { storeId } = ctx as { storeId: string };

	const body = await request.json();
	const parseResult = createCustomerSchema.safeParse(body);

	if (!parseResult.success) {
		return NextResponse.json(
			{ error: "Invalid input", details: parseResult.error.flatten() },
			{ status: 400 }
		);
	}

	// Check if customer already exists
	const existing = await getCustomerByEmail(storeId, parseResult.data.email);
	if (existing) {
		return NextResponse.json(
			{ error: "Customer with this email already exists", customer: existing },
			{ status: 409 }
		);
	}

	try {
		const customer = await createCustomer(storeId, parseResult.data);
		return NextResponse.json({ customer }, { status: 201 });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create customer";
		return NextResponse.json({ error: message }, { status: 400 });
	}
}
