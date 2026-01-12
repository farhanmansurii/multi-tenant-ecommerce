import { NextRequest } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import {
	getCustomerById,
	updateCustomer,
	deleteCustomer,
	updateCustomerSchema,
} from "@/lib/domains/customers";
import { ok, notFound, badRequest } from "@/lib/api/responses";

interface RouteParams {
	params: Promise<{
		slug: string;
		customerId: string;
	}>;
}

// GET /api/stores/[slug]/customers/[customerId] - Get customer details
export async function GET(_request: NextRequest, { params }: RouteParams) {
	const { slug, customerId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	const customer = await getCustomerById(store.id, customerId);

	if (!customer) {
		return notFound("Customer not found");
	}

	return ok({ customer });
}

// PATCH /api/stores/[slug]/customers/[customerId] - Update customer
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const { slug, customerId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	const body = await request.json();
	const parseResult = updateCustomerSchema.safeParse(body);

	if (!parseResult.success) {
		return badRequest("Invalid input");
	}

	const customer = await updateCustomer(store.id, customerId, parseResult.data);

	if (!customer) {
		return notFound("Customer not found");
	}

	return ok({ customer });
}

// DELETE /api/stores/[slug]/customers/[customerId] - Delete customer
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	const { slug, customerId } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return notFound("Store not found");
	}

	const success = await deleteCustomer(store.id, customerId);

	if (!success) {
		return notFound("Customer not found");
	}

	return ok({ success: true, message: "Customer deleted" });
}
