import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { storeHelpers } from "@/lib/domains/stores";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const [productCountResult] = await db
    .select({ count: sql<number>`COUNT(*)::int`.as("count") })
    .from(products)
    .where(eq(products.storeId, store.id));

  return NextResponse.json({
    store: {
      ...store,
      productCount: productCountResult?.count || 0,
    },
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const existing = await storeHelpers.getStoreBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await request.json();

  const [updated] = await db
    .update(stores)
    .set({
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      primaryColor: body.primaryColor ?? existing.primaryColor,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, existing.id))
    .returning();

  return NextResponse.json({ store: updated });
}
