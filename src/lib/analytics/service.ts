import { eq, and, gte, lte, sql, count, sum, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema/core/analytics-events";
import { orders, orderItems } from "@/lib/db/schema/ecommerce/orders";
import { products } from "@/lib/db/schema/ecommerce/products";

export interface AnalyticsQuery {
  storeId: string;
  startDate?: Date;
  endDate?: Date;
  eventType?: string;
  productId?: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalAddToCarts: number;
  totalPurchases: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
  trends?: {
    views: number;
    addToCarts: number;
    purchases: number;
    revenue: number;
  };
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  views: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
}

export class AnalyticsService {
  async trackEvent(event: {
    storeId: string;
    eventType: string;
    userId?: string;
    sessionId: string;
    productId?: string;
    variantId?: string;
    orderId?: string;
    quantity?: number;
    value?: number;
    currency?: string;
    metadata?: Record<string, any>;
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    url?: string;
  }) {
    await db.insert(analyticsEvents).values({
      id: crypto.randomUUID(),
      ...event,
      timestamp: new Date(),
    });
  }

  async getAnalyticsSummary(query: AnalyticsQuery): Promise<AnalyticsSummary> {
    const dateFilter = this.buildDateFilter(query);
    const orderDateFilter = query.startDate && query.endDate
      ? and(
          eq(orders.storeId, query.storeId),
          gte(orders.createdAt, query.startDate),
          lte(orders.createdAt, query.endDate)
        )
      : eq(orders.storeId, query.storeId);

    let previousPeriodStart: Date | undefined;
    let previousPeriodEnd: Date | undefined;

    if (query.startDate && query.endDate) {
      const periodDuration = query.endDate.getTime() - query.startDate.getTime();
      previousPeriodEnd = new Date(query.startDate.getTime() - 1);
      previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodDuration);
    }

    const previousOrderFilter = previousPeriodStart && previousPeriodEnd
      ? and(
          eq(orders.storeId, query.storeId),
          gte(orders.createdAt, previousPeriodStart),
          lte(orders.createdAt, previousPeriodEnd)
        )
      : undefined;

    const previousEventFilter = previousPeriodStart && previousPeriodEnd
      ? and(
          eq(analyticsEvents.storeId, query.storeId),
          gte(analyticsEvents.timestamp, previousPeriodStart),
          lte(analyticsEvents.timestamp, previousPeriodEnd)
        )
      : undefined;

    const [eventCounts, orderRevenue, previousEventCounts, previousOrderRevenue] = await Promise.all([
      db
        .select({
          eventType: analyticsEvents.eventType,
          count: count(),
          totalValue: sum(analyticsEvents.value),
        })
        .from(analyticsEvents)
        .where(and(eq(analyticsEvents.storeId, query.storeId), dateFilter))
        .groupBy(analyticsEvents.eventType),
      db
        .select({
          totalRevenue: sum(sql`(${orders.amounts}->>'total')::numeric`),
          orderCount: count(),
        })
        .from(orders)
        .where(orderDateFilter),
      previousEventFilter
        ? db
            .select({
              eventType: analyticsEvents.eventType,
              count: count(),
            })
            .from(analyticsEvents)
            .where(previousEventFilter)
            .groupBy(analyticsEvents.eventType)
        : Promise.resolve([]),
      previousOrderFilter
        ? db
            .select({
              totalRevenue: sum(sql`(${orders.amounts}->>'total')::numeric`),
              orderCount: count(),
            })
            .from(orders)
            .where(previousOrderFilter)
        : Promise.resolve([]),
    ]);

    const views = eventCounts.find(e => e.eventType === 'view_product')?.count || 0;
    const addToCarts = eventCounts.find(e => e.eventType === 'add_to_cart')?.count || 0;
    const purchases = orderRevenue[0]?.orderCount || 0;
    const revenue = parseFloat(orderRevenue[0]?.totalRevenue || '0');

    let trends: AnalyticsSummary['trends'] | undefined;
    if (previousPeriodStart && previousPeriodEnd) {
      const prevViews = previousEventCounts.find(e => e.eventType === 'view_product')?.count || 0;
      const prevAddToCarts = previousEventCounts.find(e => e.eventType === 'add_to_cart')?.count || 0;
      const prevPurchases = previousOrderRevenue[0]?.orderCount || 0;
      const prevRevenue = parseFloat(previousOrderRevenue[0]?.totalRevenue || '0');

      const calculateTrend = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      trends = {
        views: calculateTrend(views, prevViews),
        addToCarts: calculateTrend(addToCarts, prevAddToCarts),
        purchases: calculateTrend(purchases, prevPurchases),
        revenue: calculateTrend(revenue, prevRevenue),
      };
    }

    return {
      totalViews: views,
      totalAddToCarts: addToCarts,
      totalPurchases: purchases,
      totalRevenue: revenue,
      conversionRate: views > 0 ? (purchases / views) * 100 : 0,
      averageOrderValue: purchases > 0 ? revenue / purchases : 0,
      trends,
    };
  }

  async getTopProducts(query: AnalyticsQuery, limit = 10): Promise<ProductAnalytics[]> {
    const dateFilter = this.buildDateFilter(query);

    const productStats = await db
      .select({
        productId: analyticsEvents.productId,
        eventType: analyticsEvents.eventType,
        count: count(),
        totalValue: sum(analyticsEvents.value),
      })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.storeId, query.storeId),
        dateFilter,
        sql`${analyticsEvents.productId} IS NOT NULL`,
        sql`${analyticsEvents.eventType} IN ('view_product', 'add_to_cart', 'purchase')`
      ))
      .groupBy(analyticsEvents.productId, analyticsEvents.eventType);

    const productMap = new Map<string, {
      views: number;
      addToCarts: number;
      revenue: number;
    }>();

    for (const stat of productStats) {
      if (!stat.productId) continue;
      const existing = productMap.get(stat.productId) || { views: 0, addToCarts: 0, revenue: 0 };

      switch (stat.eventType) {
        case 'view_product':
          existing.views = stat.count;
          break;
        case 'add_to_cart':
          existing.addToCarts = stat.count;
          break;
        case 'purchase':
          existing.revenue = parseFloat(stat.totalValue?.toString() || '0');
          break;
      }

      productMap.set(stat.productId, existing);
    }

    const productIds = Array.from(productMap.keys())
      .sort((a, b) => {
        const aStats = productMap.get(a)!;
        const bStats = productMap.get(b)!;
        return bStats.revenue - aStats.revenue;
      })
      .slice(0, limit);

    if (productIds.length === 0) return [];

    const productDetails = await db
      .select({
        id: products.id,
        name: products.name,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    const productNameMap = new Map(productDetails.map(p => [p.id, p.name]));

    const productAnalytics: ProductAnalytics[] = productIds
      .map((productId) => {
        const stats = productMap.get(productId)!;
        const productName = productNameMap.get(productId);
        if (!productName) return null;

        return {
          productId,
          productName,
          views: stats.views,
          addToCarts: stats.addToCarts,
          purchases: 0,
          revenue: stats.revenue,
          conversionRate: stats.views > 0 ? (stats.addToCarts / stats.views) * 100 : 0,
        };
      })
      .filter((p): p is ProductAnalytics => p !== null);

    return productAnalytics;
  }

  async getConversionFunnel(query: AnalyticsQuery) {
    const dateFilter = this.buildDateFilter(query);

    const funnelData = await db
      .select({
        step: analyticsEvents.eventType,
        count: count(),
        uniqueSessions: count(sql`DISTINCT ${analyticsEvents.sessionId}`),
      })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.storeId, query.storeId),
        dateFilter,
        sql`${analyticsEvents.eventType} IN ('view_product', 'add_to_cart', 'checkout_start', 'purchase')`
      ))
      .groupBy(analyticsEvents.eventType);

    return {
      views: funnelData.find(d => d.step === 'view_product')?.uniqueSessions || 0,
      addToCarts: funnelData.find(d => d.step === 'add_to_cart')?.uniqueSessions || 0,
      checkouts: funnelData.find(d => d.step === 'checkout_start')?.uniqueSessions || 0,
      purchases: funnelData.find(d => d.step === 'purchase')?.uniqueSessions || 0,
    };
  }

  async getRevenueByPeriod(query: AnalyticsQuery, period: 'day' | 'week' | 'month' = 'day') {
    const dateFilter = this.buildDateFilter(query);

    let dateTrunc;
    switch (period) {
      case 'day':
        dateTrunc = sql`DATE_TRUNC('day', ${analyticsEvents.timestamp})`;
        break;
      case 'week':
        dateTrunc = sql`DATE_TRUNC('week', ${analyticsEvents.timestamp})`;
        break;
      case 'month':
        dateTrunc = sql`DATE_TRUNC('month', ${analyticsEvents.timestamp})`;
        break;
    }

    const revenueData = await db
      .select({
        period: dateTrunc,
        revenue: sum(analyticsEvents.value),
        orders: count(sql`DISTINCT ${analyticsEvents.orderId}`),
      })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.storeId, query.storeId),
        dateFilter,
        eq(analyticsEvents.eventType, 'purchase')
      ))
      .groupBy(dateTrunc)
      .orderBy(dateTrunc);

    return revenueData.map(row => ({
      period: row.period,
      revenue: parseFloat(row.revenue?.toString() || '0'),
      orders: row.orders,
    }));
  }

  private buildDateFilter(query: AnalyticsQuery) {
    const conditions = [];

    if (query.startDate) {
      conditions.push(gte(analyticsEvents.timestamp, query.startDate));
    }

    if (query.endDate) {
      conditions.push(lte(analyticsEvents.timestamp, query.endDate));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }
}

export const analyticsService = new AnalyticsService();
