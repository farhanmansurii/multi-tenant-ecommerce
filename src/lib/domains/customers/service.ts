import { eq, and, desc, sql, ilike, or, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/lib/db";
import { storeCustomers } from "@/lib/db/schema/core/store-customers";
import { orders } from "@/lib/db/schema/ecommerce/orders";
import type { Customer, CustomerSummary, WishlistItem } from "./types";
import type { CreateCustomerInput, UpdateCustomerInput, CustomerQueryInput, AddToWishlistInput } from "./validation";

// Create customer
export async function createCustomer(
	storeId: string,
	input: CreateCustomerInput
): Promise<Customer> {
	const customerId = createId();

	await db.insert(storeCustomers).values({
		id: customerId,
		storeId,
		userId: input.userId || null,
		email: input.email,
		data: input.data || {},
	});

	return getCustomerById(storeId, customerId) as Promise<Customer>;
}

// Get customer by ID
export async function getCustomerById(storeId: string, customerId: string): Promise<Customer | null> {
	const result = await db
		.select()
		.from(storeCustomers)
		.where(and(eq(storeCustomers.id, customerId), eq(storeCustomers.storeId, storeId)))
		.limit(1);

	if (result.length === 0) return null;

	const customer = result[0];
	return {
		id: customer.id,
		storeId: customer.storeId,
		userId: customer.userId,
		email: customer.email,
		data: (customer.data as Customer["data"]) || {},
		wishlist: (customer.wishlist as WishlistItem[]) || [],
		savedAddresses: (customer.savedAddresses as Customer["savedAddresses"]) || [],
		createdAt: customer.createdAt,
		updatedAt: customer.updatedAt,
	};
}

// Get customer by email
export async function getCustomerByEmail(storeId: string, email: string): Promise<Customer | null> {
	const result = await db
		.select()
		.from(storeCustomers)
		.where(and(eq(storeCustomers.email, email), eq(storeCustomers.storeId, storeId)))
		.limit(1);

	if (result.length === 0) return null;

	return getCustomerById(storeId, result[0].id);
}

// Get customer by userId (BetterAuth user ID)
export async function getCustomerByUserId(storeId: string, userId: string): Promise<Customer | null> {
	const result = await db
		.select()
		.from(storeCustomers)
		.where(and(eq(storeCustomers.userId, userId), eq(storeCustomers.storeId, storeId)))
		.limit(1);

	if (result.length === 0) return null;

	return getCustomerById(storeId, result[0].id);
}

// List customers with pagination
export async function listCustomers(
	storeId: string,
	query: CustomerQueryInput
): Promise<{ customers: CustomerSummary[]; total: number }> {
	const { page, limit, search } = query;
	const offset = (page - 1) * limit;

	let whereClause = eq(storeCustomers.storeId, storeId);

	if (search) {
		whereClause = and(
			whereClause,
			or(
				ilike(storeCustomers.email, `%${search}%`),
				sql`${storeCustomers.data}->>'name' ILIKE ${`%${search}%`}`
			)
		) as typeof whereClause;
	}

	const [result, countResult] = await Promise.all([
		db
			.select({
				id: storeCustomers.id,
				email: storeCustomers.email,
				data: storeCustomers.data,
				createdAt: storeCustomers.createdAt,
			})
			.from(storeCustomers)
			.where(whereClause)
			.orderBy(desc(storeCustomers.createdAt))
			.limit(limit)
			.offset(offset),
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(storeCustomers)
			.where(whereClause),
	]);

	const customerIds = result.map((c) => c.id);
	const orderCounts =
		customerIds.length > 0
			? await db
					.select({
						customerId: orders.customerId,
						count: sql<number>`COUNT(*)::int`,
					})
					.from(orders)
					.where(and(eq(orders.storeId, storeId), inArray(orders.customerId, customerIds)))
					.groupBy(orders.customerId)
			: [];

	const orderCountMap = new Map(orderCounts.map((oc) => [oc.customerId, oc.count]));

	const customerSummaries: CustomerSummary[] = result.map((c) => ({
		id: c.id,
		email: c.email,
		name: (c.data as { name?: string })?.name,
		orderCount: orderCountMap.get(c.id) || 0,
		createdAt: c.createdAt,
	}));

	return {
		customers: customerSummaries,
		total: countResult[0]?.count || 0,
	};
}

// Update customer
export async function updateCustomer(
	storeId: string,
	customerId: string,
	input: UpdateCustomerInput
): Promise<Customer | null> {
	const existing = await getCustomerById(storeId, customerId);
	if (!existing) return null;

	const updateData: Record<string, unknown> = { updatedAt: new Date() };

	if (input.email) updateData.email = input.email;
	if (input.data) {
		updateData.data = { ...existing.data, ...input.data };
	}

	await db
		.update(storeCustomers)
		.set(updateData)
		.where(and(eq(storeCustomers.id, customerId), eq(storeCustomers.storeId, storeId)));

	return getCustomerById(storeId, customerId);
}

// Delete customer
export async function deleteCustomer(storeId: string, customerId: string): Promise<boolean> {
	const result = await db
		.delete(storeCustomers)
		.where(and(eq(storeCustomers.id, customerId), eq(storeCustomers.storeId, storeId)))
		.returning({ id: storeCustomers.id });

	return result.length > 0;
}

// Add to wishlist
export async function addToWishlist(
	storeId: string,
	customerId: string,
	input: AddToWishlistInput
): Promise<WishlistItem[]> {
	const customer = await getCustomerById(storeId, customerId);
	if (!customer) throw new Error("Customer not found");

	// Check if already in wishlist
	const existingIndex = customer.wishlist.findIndex((item) => item.productId === input.productId);
	if (existingIndex !== -1) {
		return customer.wishlist;
	}

	const newItem: WishlistItem = {
		productId: input.productId,
		productSlug: input.productSlug,
		addedAt: new Date().toISOString(),
	};

	const updatedWishlist = [...customer.wishlist, newItem];

	await db
		.update(storeCustomers)
		.set({ wishlist: updatedWishlist, updatedAt: new Date() })
		.where(and(eq(storeCustomers.id, customerId), eq(storeCustomers.storeId, storeId)));

	return updatedWishlist;
}

// Remove from wishlist
export async function removeFromWishlist(
	storeId: string,
	customerId: string,
	productId: string
): Promise<WishlistItem[]> {
	const customer = await getCustomerById(storeId, customerId);
	if (!customer) throw new Error("Customer not found");

	const updatedWishlist = customer.wishlist.filter((item) => item.productId !== productId);

	await db
		.update(storeCustomers)
		.set({ wishlist: updatedWishlist, updatedAt: new Date() })
		.where(and(eq(storeCustomers.id, customerId), eq(storeCustomers.storeId, storeId)));

	return updatedWishlist;
}

// Get wishlist
export async function getWishlist(storeId: string, customerId: string): Promise<WishlistItem[]> {
	const customer = await getCustomerById(storeId, customerId);
	if (!customer) throw new Error("Customer not found");
	return customer.wishlist;
}
