import { NextResponse } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import {
	getCustomerById,
	updateCustomer,
	deleteCustomer,
	updateCustomerSchema,
} from "@/lib/domains/customers";

interface RouteParams {
	params: Promise<{
		slug: string;
		customerId: string;
	}>;
}

// GET /api/stores/[slug]/customers/[customerId] - Get customer details
export async function GET(_request: Request, { params }: RouteParams) {
	const { slug, customerId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const customer = await getCustomerById(store.id, customerId);

	if (!customer) {
		return NextResponse.json({ error: "Customer not found" }, { status: 404 });
	}

	return NextResponse.json({ customer });
}

// PATCH /api/stores/[slug]/customers/[customerId] - Update customer
export async function PATCH(request: Request, { params }: RouteParams) {
	const { slug, customerId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const body = await request.json();
	const parseResult = updateCustomerSchema.safeParse(body);

	if (!parseResult.success) {
		return NextResponse.json(
			{ error: "Invalid input", details: parseResult.error.flatten() },
			{ status: 400 }
		);
	}

	const customer = await updateCustomer(store.id, customerId, parseResult.data);

	if (!customer) {
		return NextResponse.json({ error: "Customer not found" }, { status: 404 });
	}

	return NextResponse.json({ customer });
}

// DELETE /api/stores/[slug]/customers/[customerId] - Delete customer
export async function DELETE(_request: Request, { params }: RouteParams) {
	const { slug, customerId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: "Store not found" }, { status: 404 });
	}

	const success = await deleteCustomer(store.id, customerId);

	if (!success) {
		return NextResponse.json({ error: "Customer not found" }, { status: 404 });
	}

	return NextResponse.json({ success: true, message: "Customer deleted" });
}
