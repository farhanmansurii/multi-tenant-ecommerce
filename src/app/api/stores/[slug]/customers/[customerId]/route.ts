import { NextRequest } from "next/server";

import { getApiContextOrNull } from "@/lib/api/context";
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  updateCustomerSchema,
} from "@/lib/domains/customers";
import { ok, notFound, badRequest } from "@/lib/api/responses";
import { isStoreMember } from "@/lib/api/middleware/authorization";
import { logAuthorizationFailure } from "@/lib/security/logger";

interface RouteParams {
  params: Promise<{
    slug: string;
    customerId: string;
  }>;
}

// GET /api/stores/[slug]/customers/[customerId] - Get customer details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug, customerId } = await params;

  const ctx = await getApiContextOrNull(request, slug);
  if (ctx instanceof Response) return ctx;
  if (!ctx) return notFound("Store not found");

  // Verify user is store member (owner or admin)
  const hasAccess = await isStoreMember(ctx.storeId, ctx.userId);
  if (!hasAccess) {
    logAuthorizationFailure(
      "customer",
      customerId,
      ctx.userId,
      ctx.storeId,
      `/api/stores/${slug}/customers/${customerId}`,
      "GET",
    );
    return notFound("Customer not found");
  }

  const customer = await getCustomerById(ctx.storeId, customerId);

  if (!customer) {
    return notFound("Customer not found");
  }

  return ok({ customer });
}

// PATCH /api/stores/[slug]/customers/[customerId] - Update customer
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { slug, customerId } = await params;

  const ctx = await getApiContextOrNull(request, slug);
  if (ctx instanceof Response) return ctx;
  if (!ctx) return notFound("Store not found");

  // Verify user is store member (owner or admin)
  const hasAccess = await isStoreMember(ctx.storeId, ctx.userId);
  if (!hasAccess) {
    logAuthorizationFailure(
      "customer",
      customerId,
      ctx.userId,
      ctx.storeId,
      `/api/stores/${slug}/customers/${customerId}`,
      "PATCH",
    );
    return notFound("Customer not found");
  }

  const body = await request.json();
  const parseResult = updateCustomerSchema.safeParse(body);

  if (!parseResult.success) {
    return badRequest("Invalid input");
  }

  const customer = await updateCustomer(ctx.storeId, customerId, parseResult.data);

  if (!customer) {
    return notFound("Customer not found");
  }

  return ok({ customer });
}

// DELETE /api/stores/[slug]/customers/[customerId] - Delete customer
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { slug, customerId } = await params;

  const ctx = await getApiContextOrNull(request, slug);
  if (ctx instanceof Response) return ctx;
  if (!ctx) return notFound("Store not found");

  // Verify user is store member (owner or admin)
  const hasAccess = await isStoreMember(ctx.storeId, ctx.userId);
  if (!hasAccess) {
    logAuthorizationFailure(
      "customer",
      customerId,
      ctx.userId,
      ctx.storeId,
      `/api/stores/${slug}/customers/${customerId}`,
      "DELETE",
    );
    return notFound("Customer not found");
  }

  const success = await deleteCustomer(ctx.storeId, customerId);

  if (!success) {
    return notFound("Customer not found");
  }

  return ok({ success: true, message: "Customer deleted" });
}
