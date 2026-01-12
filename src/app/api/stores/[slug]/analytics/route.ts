import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema/core/stores";
import { requireAuthOrNull } from "@/lib/session/helpers";
import { analyticsService } from "@/lib/analytics/service";
import { unauthorized, notFound, serverError, ok, badRequest } from "@/lib/api/responses";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAuthOrNull();
    if (!session) {
      return unauthorized();
    }

    const { slug } = await params;

    // Verify store ownership
    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);

    if (!store[0] || store[0].ownerUserId !== session.user.id) {
      return notFound("Store not found or access denied");
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const period = (searchParams.get('period') as 'day' | 'week' | 'month') || 'day';

    // Get analytics data in parallel
    const [summary, topProducts, funnel, revenueByPeriod] = await Promise.all([
      analyticsService.getAnalyticsSummary({ storeId: store[0].id, startDate, endDate }),
      analyticsService.getTopProducts({ storeId: store[0].id, startDate, endDate }, 10),
      analyticsService.getConversionFunnel({ storeId: store[0].id, startDate, endDate }),
      analyticsService.getRevenueByPeriod({ storeId: store[0].id, startDate, endDate }, period),
    ]);

    return ok({
      summary,
      topProducts,
      funnel,
      revenueByPeriod,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return serverError();
  }
}

// POST endpoint for tracking events (can be called from frontend)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Verify store exists (don't require auth for event tracking)
    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);

    if (!store[0]) {
      return notFound("Store not found");
    }

    const body = await request.json();
    const {
      eventType,
      userId,
      sessionId,
      productId,
      variantId,
      orderId,
      quantity,
      value,
      currency,
      metadata,
    } = body;

    // Basic validation
    if (!eventType || !sessionId) {
      return badRequest("eventType and sessionId are required");
    }

    // Get client info from request
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const referrer = request.headers.get('referer') || undefined;
    const url = request.headers.get('x-url') || undefined;

    await analyticsService.trackEvent({
      storeId: store[0].id,
      eventType,
      userId,
      sessionId,
      productId,
      variantId,
      orderId,
      quantity,
      value: value ? Math.round(value * 100) : undefined, // Convert to cents
      currency: currency || store[0].currency,
      metadata,
      userAgent,
      ipAddress,
      referrer,
      url,
    });

    return ok({ success: true });
  } catch (error) {
    console.error("Error tracking analytics event:", error);
    return serverError();
  }
}
