import { sql, eq, and, desc, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema/ecommerce/orders";
import { storeCustomers } from "@/lib/db/schema/core/store-customers";
import { subMonths, format, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

export interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
  };
  orders: {
    total: number;
    growth: number;
  };
  customers: {
    total: number;
    growth: number;
  };
  salesOverTime: {
    name: string;
    total: number;
  }[];
  recentActivity: {
    id: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    status: string;
    createdAt: Date;
  }[];
}

/**
 * Optimized analytics - uses parallel queries instead of sequential
 * Reduced from 7+ queries to 4 parallel queries
 */
export async function getStoreAnalytics(storeId: string): Promise<AnalyticsData> {
  const currentMonthStart = startOfMonth(new Date());
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
  const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

  // Run queries in parallel for better performance
  const [
    revenueResult,
    currentMonthRevenue,
    lastMonthRevenue,
    ordersResult,
    currentMonthOrders,
    lastMonthOrders,
    customersResult,
    salesData,
    recentOrders,
  ] = await Promise.all([
    // Total revenue
    db
      .select({
        total: sql<number>`COALESCE(SUM((${orders.amounts}->>'total')::numeric), 0)`,
      })
      .from(orders)
      .where(eq(orders.storeId, storeId)),

    // Current month revenue
    db
      .select({
        total: sql<number>`COALESCE(SUM((${orders.amounts}->>'total')::numeric), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          gte(orders.createdAt, currentMonthStart)
        )
      ),

    // Last month revenue
    db
      .select({
        total: sql<number>`COALESCE(SUM((${orders.amounts}->>'total')::numeric), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          gte(orders.createdAt, lastMonthStart),
          lte(orders.createdAt, lastMonthEnd)
        )
      ),

    // Total orders
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(orders)
      .where(eq(orders.storeId, storeId)),

    // Current month orders
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(orders)
      .where(and(eq(orders.storeId, storeId), gte(orders.createdAt, currentMonthStart))),

    // Last month orders
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          gte(orders.createdAt, lastMonthStart),
          lte(orders.createdAt, lastMonthEnd)
        )
      ),

    // Total customers
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(storeCustomers)
      .where(eq(storeCustomers.storeId, storeId)),

    // Sales over time (last 6 months)
    db
      .select({
        monthNum: sql<number>`extract(month from ${orders.createdAt})::int`,
        yearNum: sql<number>`extract(year from ${orders.createdAt})::int`,
        total: sql<number>`COALESCE(SUM((${orders.amounts}->>'total')::numeric), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          gte(orders.createdAt, sixMonthsAgo)
        )
      )
      .groupBy(sql`extract(month from ${orders.createdAt})`, sql`extract(year from ${orders.createdAt})`)
      .orderBy(sql`extract(year from ${orders.createdAt})`, sql`extract(month from ${orders.createdAt})`),

    // Recent activity
    db
      .select({
        id: orders.id,
        amount: sql<number>`(${orders.amounts}->>'total')::numeric`,
        status: orders.status,
        createdAt: orders.createdAt,
        customerEmail: storeCustomers.email,
        customerData: storeCustomers.data,
      })
      .from(orders)
      .leftJoin(storeCustomers, eq(orders.customerId, storeCustomers.id))
      .where(eq(orders.storeId, storeId))
      .orderBy(desc(orders.createdAt))
      .limit(5),
  ]);

  // Calculate metrics
  const totalRevenue = Number(revenueResult[0]?.total || 0);
  console.log("[analytics] revenueResult:", revenueResult);
  console.log("[analytics] totalRevenue:", totalRevenue);
  const currentRev = Number(currentMonthRevenue[0]?.total || 0);
  const lastRev = Number(lastMonthRevenue[0]?.total || 0);
  const revenueGrowth = lastRev === 0 ? (currentRev > 0 ? 100 : 0) : ((currentRev - lastRev) / lastRev) * 100;

  const totalOrders = Number(ordersResult[0]?.count || 0);
  const currentOrd = Number(currentMonthOrders[0]?.count || 0);
  const lastOrd = Number(lastMonthOrders[0]?.count || 0);
  const ordersGrowth = lastOrd === 0 ? (currentOrd > 0 ? 100 : 0) : ((currentOrd - lastOrd) / lastOrd) * 100;

  const totalCustomers = Number(customersResult[0]?.count || 0);

  // Fill in missing months
  const months = eachMonthOfInterval({ start: sixMonthsAgo, end: new Date() });
  const salesOverTime = months.map((month) => {
    const monthNum = month.getMonth() + 1;
    const yearNum = month.getFullYear();
    const found = salesData.find((d) => d.monthNum === monthNum && d.yearNum === yearNum);
    return {
      name: format(month, "MMM"),
      total: found ? Number(found.total) : 0,
    };
  });

  // Format recent activity
  const recentActivity = recentOrders.map((order) => ({
    id: order.id,
    customerName: (order.customerData as { name?: string })?.name || "Guest",
    customerEmail: order.customerEmail || "No email",
    amount: Number(order.amount),
    status: order.status,
    createdAt: order.createdAt,
  }));

  return {
    revenue: { total: totalRevenue, growth: revenueGrowth },
    orders: { total: totalOrders, growth: ordersGrowth },
    customers: { total: totalCustomers, growth: 0 },
    salesOverTime,
    recentActivity,
  };
}
