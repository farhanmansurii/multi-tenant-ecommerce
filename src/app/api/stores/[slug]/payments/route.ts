import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { ok } from "@/lib/api/responses";
import { withStoreContext } from "@/lib/api/handlers";
import { createPayment, createPaymentSchema } from "@/lib/domains/payments";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const ctxOrResponse = await withStoreContext<{ storeId: string }>(request, slug, undefined, { enforceOwner: true });
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

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const ctxOrResponse = await withStoreContext<{ storeId: string }>(request, slug);
  if ((ctxOrResponse as unknown as Response) instanceof Response) {
    return ctxOrResponse as unknown as Response;
  }

  const { storeId } = ctxOrResponse as { storeId: string };

  const body = await request.json();
  const parseResult = createPaymentSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const payment = await createPayment(storeId, parseResult.data);
    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
