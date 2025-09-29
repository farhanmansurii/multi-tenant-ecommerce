import { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { ok } from "@/lib/api/responses";
import { withStoreContext } from "@/lib/api/handlers";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const ctxOrResponse = await withStoreContext<{ storeId: string }>(request, slug);
  // If helper returned a Response, forward it
  if ((ctxOrResponse as unknown as Response) instanceof Response) {
    return ctxOrResponse as unknown as Response;
  }

  const { storeId } = ctxOrResponse as { storeId: string };

  const results = await db
    .select()
    .from(payments)
    .where(and(eq(payments.storeId, storeId)))
    .orderBy(desc(payments.createdAt))
    .limit(50);

  return ok({ payments: results, count: results.length });
}
