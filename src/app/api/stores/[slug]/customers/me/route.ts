import { NextResponse, type NextRequest } from "next/server";

import { getCustomerByUserId } from "@/lib/domains/customers";
import { withStoreContext } from "@/lib/api/handlers";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// GET /api/stores/[slug]/customers/me - Get current customer details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  // Verify store context and get authenticated user
  const ctx = await withStoreContext<{ storeId: string; userId?: string }>(
    request,
    slug,
    undefined,
    { getSession: true }
  );

  if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;
  const { storeId, userId } = ctx as { storeId: string; userId?: string };

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customer = await getCustomerByUserId(storeId, userId);

  if (!customer) {
    return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
  }

  return NextResponse.json({ customer });
}
