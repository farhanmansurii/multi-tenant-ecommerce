import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { storeMembers, stores } from "@/lib/db/schema";
import { storeCustomers } from "@/lib/db/schema/core/store-customers";
import { orders } from "@/lib/db/schema/ecommerce/orders";
import { eq, and } from "drizzle-orm";
import { notFound } from "@/lib/api/responses";

export type ResourceType = "customer" | "order" | "product" | "category";

export interface AuthorizationContext {
  userId: string;
  storeId: string;
  sessionType: "admin" | "customer";
}

/**
 * Check if user is a store member (owner or admin)
 */
export async function isStoreMember(storeId: string, userId: string): Promise<boolean> {
  const [member] = await db
    .select()
    .from(storeMembers)
    .where(and(eq(storeMembers.storeId, storeId), eq(storeMembers.userId, userId)))
    .limit(1);

  return !!member;
}

/**
 * Check if user is store owner
 */
export async function isStoreOwner(storeId: string, userId: string): Promise<boolean> {
  const [store] = await db
    .select()
    .from(stores)
    .where(and(eq(stores.id, storeId), eq(stores.ownerUserId, userId)))
    .limit(1);

  return !!store;
}

/**
 * Verify customer belongs to user (for customer sessions)
 */
export async function verifyCustomerOwnership(
  customerId: string,
  userId: string,
): Promise<boolean> {
  const [customer] = await db
    .select()
    .from(storeCustomers)
    .where(and(eq(storeCustomers.id, customerId), eq(storeCustomers.userId, userId)))
    .limit(1);

  return !!customer;
}

/**
 * Verify order belongs to customer
 */
export async function verifyOrderOwnership(orderId: string, customerId: string): Promise<boolean> {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.customerId, customerId)))
    .limit(1);

  return !!order;
}

/**
 * Get customer ID for a user in a store
 */
export async function getCustomerIdForUser(
  storeId: string,
  userId: string,
): Promise<string | null> {
  const [customer] = await db
    .select({ id: storeCustomers.id })
    .from(storeCustomers)
    .where(and(eq(storeCustomers.storeId, storeId), eq(storeCustomers.userId, userId)))
    .limit(1);

  return customer?.id || null;
}

/**
 * Middleware to verify resource ownership
 * Returns null if authorized, Response if not (to return from route handler)
 */
export async function requireResourceOwnership(
  request: NextRequest,
  resourceType: ResourceType,
  resourceId: string,
  storeId: string,
  userId: string,
  sessionType: "admin" | "customer" = "admin",
): Promise<null | Response> {
  // Admin sessions: check if user is store member or owner
  if (sessionType === "admin") {
    const hasAccess = await isStoreMember(storeId, userId);
    if (!hasAccess) {
      // Return 404 to prevent store enumeration
      return notFound("Resource not found");
    }
    return null;
  }

  // Customer sessions: check if user owns the specific resource
  if (sessionType === "customer") {
    if (resourceType === "customer") {
      const isOwner = await verifyCustomerOwnership(resourceId, userId);
      if (!isOwner) {
        return notFound("Resource not found");
      }
    } else if (resourceType === "order") {
      const customerId = await getCustomerIdForUser(storeId, userId);
      if (!customerId) {
        return notFound("Resource not found");
      }
      const isOwner = await verifyOrderOwnership(resourceId, customerId);
      if (!isOwner) {
        return notFound("Resource not found");
      }
    } else {
      // For other resource types, customers don't have access
      return notFound("Resource not found");
    }
  }

  return null;
}

/**
 * Higher-order function to create resource authorization handler
 */
export function withResourceAuthorization(
  resourceType: ResourceType,
  handler: (
    request: NextRequest,
    context: { params: Promise<{ slug: string; [key: string]: string }> },
    auth: AuthorizationContext,
  ) => Promise<Response>,
) {
  return async (
    request: NextRequest,
    context: { params: Promise<{ slug: string; [key: string]: string }> },
  ): Promise<Response> => {
    // Extract resource ID from params
    const params = await context.params;
    const resourceId = params[`${resourceType}Id`] || params.id;

    if (!resourceId) {
      return notFound("Resource not found");
    }

    // TODO: Extract userId and sessionType from session
    // This is a placeholder - actual implementation depends on session handling
    const userId = ""; // Get from session
    const sessionType: "admin" | "customer" = "admin"; // Determine from session
    const storeId = ""; // Get from store context

    const authError = await requireResourceOwnership(
      request,
      resourceType,
      resourceId,
      storeId,
      userId,
      sessionType,
    );

    if (authError) {
      return authError;
    }

    return handler(request, context, { userId, storeId, sessionType });
  };
}
