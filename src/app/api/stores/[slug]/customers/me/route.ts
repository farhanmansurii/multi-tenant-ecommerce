import { NextRequest } from "next/server";

import { getCustomerByUserId } from "@/lib/domains/customers";
import { getApiContextOrNull } from "@/lib/api/context";
import { ok, unauthorized, notFound } from "@/lib/api/responses";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// GET /api/stores/[slug]/customers/me - Get current customer details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  const ctx = await getApiContextOrNull(request, slug);
  if (ctx instanceof Response) return ctx;
  if (!ctx || !ctx.userId) {
    return unauthorized();
  }

  const customer = await getCustomerByUserId(ctx.storeId, ctx.userId);

  if (!customer) {
    return notFound("Customer profile not found");
  }

  return ok({ customer });
}
