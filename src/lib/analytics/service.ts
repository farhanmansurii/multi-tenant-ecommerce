import { eq, and, gte, lte, desc, sql, count, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema/shopify";
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
  conversionRate: number; // purchases / views
  averageOrderValue: number;
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
    value?: number; // in cents
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

    // Get event counts
    const eventCounts = await db
      .select({
        eventType: analyticsEvents.eventType,
        count: count(),
        totalValue: sum(analyticsEvents.value),
      })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.storeId, query.storeId),
        dateFilter
      ))
      .groupBy(analyticsEvents.eventType);

    // Get order data for revenue
    const orderRevenue = await db
      .select({
        totalRevenue: sum(sql`(${orders.amounts}->>'total')::numeric`),
        orderCount: count(),
      })
      .from(orders)
      .where(and(
        eq(orders.storeId, query.storeId),
        query.startDate ? gte(orders.createdAt, query.startDate) : undefined,
        query.endDate ? lte(orders.createdAt, query.endDate) : undefined
      ));

    const views = eventCounts.find(e => e.eventType === 'view_product')?.count || 0;
    const addToCarts = eventCounts.find(e => e.eventType === 'add_to_cart')?.count || 0;
    const purchases = orderRevenue[0]?.orderCount || 0;
    const revenue = parseFloat(orderRevenue[0]?.totalRevenue || '0');

    return {
      totalViews: views,
      totalAddToCarts: addToCarts,
      totalPurchases: purchases,
      totalRevenue: revenue,
      conversionRate: views > 0 ? (purchases / views) * 100 : 0,
      averageOrderValue: purchases > 0 ? revenue / purchases : 0,
    };
  }

  async getTopProducts(query: AnalyticsQuery, limit = 10): Promise<ProductAnalytics[]> {
    const dateFilter = this.buildDateFilter(query);

    // Get product performance data
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
        sql`${analyticsEvents.productId} IS NOT NULL`
      ))
      .groupBy(analyticsEvents.productId, analyticsEvents.eventType);

    // Aggregate by product
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

    // Get product details and calculate conversion rates
    const productAnalytics: ProductAnalytics[] = [];

    for (const [productId, stats] of productMap) {
      const product = await db
        .select({
          name: products.name,
        })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (product[0]) {
        productAnalytics.push({
          productId,
          productName: product[0].name,
          views: stats.views,
          addToCarts: stats.addToCarts,
          purchases: 0, // We'll need to calculate this from orders
          revenue: stats.revenue,
          conversionRate: stats.views > 0 ? (stats.addToCarts / stats.views) * 100 : 0,
        });
      }
    }

    // Sort by revenue and return top products
    return productAnalytics
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
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
