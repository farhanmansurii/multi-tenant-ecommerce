import { NextRequest } from "next/server";
import { requireAuthOrNull } from "@/lib/session/helpers";
import { storeHelpers } from "@/lib/domains/stores";
import { analyticsService } from "@/lib/analytics/service";
import { unauthorized, notFound, serverError, ok, badRequest } from "@/lib/api/responses";
import { CACHE_CONFIG } from "@/lib/api/cache-config";

export const revalidate = CACHE_CONFIG.ANALYTICS.revalidate;

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
    const store = await storeHelpers.getStoreBySlug(slug);

    if (!store || store.ownerUserId !== session.user.id) {
      return notFound("Store not found or access denied");
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const period = (searchParams.get('period') as 'day' | 'week' | 'month') || 'day';

    const queryParams = { storeId: store.id, startDate, endDate };

    const [summary, topProducts, funnel, revenueByPeriod] = await Promise.all([
      analyticsService.getAnalyticsSummary(queryParams),
      analyticsService.getTopProducts(queryParams, 10),
      analyticsService.getConversionFunnel(queryParams),
      analyticsService.getRevenueByPeriod(queryParams, period),
    ]);

    return ok(
      { summary, topProducts, funnel, revenueByPeriod },
      {
        headers: {
          'Cache-Control': CACHE_CONFIG.ANALYTICS.cacheControl,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return serverError();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const store = await storeHelpers.getStoreBySlug(slug);

    if (!store) {
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

    if (!eventType || !sessionId) {
      return badRequest("eventType and sessionId are required");
    }

    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const referrer = request.headers.get('referer') || undefined;
    const url = request.headers.get('x-url') || undefined;

    await analyticsService.trackEvent({
      storeId: store.id,
      eventType,
      userId,
      sessionId,
      productId,
      variantId,
      orderId,
      quantity,
      value: value ? Math.round(value * 100) : undefined,
      currency: currency || store.currency,
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
