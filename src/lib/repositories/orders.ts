import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema/ecommerce/orders";
import { products } from "@/lib/db/schema/ecommerce/products";
import type {
  Order,
  OrderAddress,
  OrderAmounts,
  OrderItem,
  OrderPaymentStatus,
  OrderStatus,
  OrderSummary,
} from "@/lib/domains/orders/types";
import type { OrderQueryInput } from "@/lib/domains/orders/validation";
import type { DbExecutor, RepositoryOptions } from "@/lib/repositories/types";

export interface OrderItemInsertion {
  id: string;
  storeId: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  qty: number;
  unitPriceCents: number;
  totalPriceCents: number;
}

export interface OrderCreationPayload {
  id: string;
  storeId: string;
  customerId: string;
  orderNumber: number;
  status: OrderStatus;
  amounts: OrderAmounts;
  currency: string;
  paymentStatus: OrderPaymentStatus;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  items: OrderItemInsertion[];
}

export interface OrderRepository {
  getNextOrderNumber(storeId: string, options?: RepositoryOptions): Promise<number>;
  create(payload: OrderCreationPayload, options?: RepositoryOptions): Promise<Order>;
  findByIdWithItems(
    storeId: string,
    orderId: string,
    options?: RepositoryOptions,
  ): Promise<Order | null>;
  list(
    storeId: string,
    query: OrderQueryInput,
    options?: RepositoryOptions,
  ): Promise<{ orders: OrderSummary[]; total: number }>;
  updateStatus(
    storeId: string,
    orderId: string,
    status: OrderStatus,
    options?: RepositoryOptions,
  ): Promise<Order | null>;
  cancel(storeId: string, orderId: string, options?: RepositoryOptions): Promise<boolean>;
}

export class DrizzleOrderRepository implements OrderRepository {
  constructor(private readonly defaultExecutor: DbExecutor = db) {}

  private resolveExecutor(options?: RepositoryOptions): DbExecutor {
    return options?.executor ?? this.defaultExecutor;
  }

  async getNextOrderNumber(storeId: string, options?: RepositoryOptions): Promise<number> {
    const executor = this.resolveExecutor(options);
    const [result] = await executor
      .select({ maxNumber: sql<number>`COALESCE(MAX(${orders.orderNumber}), 0)` })
      .from(orders)
      .where(eq(orders.storeId, storeId));
    return (result?.maxNumber || 0) + 1;
  }

  async create(payload: OrderCreationPayload, options?: RepositoryOptions): Promise<Order> {
    const executor = this.resolveExecutor(options);
    await executor.insert(orders).values({
      id: payload.id,
      storeId: payload.storeId,
      customerId: payload.customerId,
      orderNumber: payload.orderNumber,
      status: payload.status,
      amounts: payload.amounts,
      currency: payload.currency,
      paymentStatus: payload.paymentStatus,
      shippingAddress: payload.shippingAddress,
      billingAddress: payload.billingAddress,
    });

    await executor.insert(orderItems).values(payload.items);

    const created = await this.findByIdWithItems(payload.storeId, payload.id, options);
    if (!created) {
      throw new Error("Failed to read back created order");
    }

    return created;
  }

  async findByIdWithItems(
    storeId: string,
    orderId: string,
    options?: RepositoryOptions,
  ): Promise<Order | null> {
    const executor = this.resolveExecutor(options);
    const [orderRow] = await executor
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
      .limit(1);

    if (!orderRow) return null;

    const items = await executor
      .select({
        item: orderItems,
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          images: products.images,
        },
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    const mappedItems: OrderItem[] = items.map((row) => ({
      ...row.item,
      product: row.product
        ? {
            id: row.product.id,
            name: row.product.name,
            slug: row.product.slug,
            images: (row.product.images as Array<{ url: string; alt: string }>) || [],
          }
        : undefined,
    }));

    return {
      ...orderRow,
      items: mappedItems,
    };
  }

  async list(
    storeId: string,
    query: OrderQueryInput,
    options?: RepositoryOptions,
  ): Promise<{ orders: OrderSummary[]; total: number }> {
    const executor = this.resolveExecutor(options);
    const { page, limit, status, customerId } = query;
    const offset = (page - 1) * limit;

    const conditions = [eq(orders.storeId, storeId)];
    if (status) conditions.push(eq(orders.status, status));
    if (customerId) conditions.push(eq(orders.customerId, customerId));

    const whereClause = and(...conditions);

    const [result, countResult] = await Promise.all([
      executor
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          amounts: orders.amounts,
          currency: orders.currency,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      executor
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(orders)
        .where(whereClause),
    ]);

    const orderIds = result.map((o) => o.id);
    const itemCounts =
      orderIds.length > 0
        ? await executor
            .select({
              orderId: orderItems.orderId,
              count: sql<number>`SUM(${orderItems.qty})::int`,
            })
            .from(orderItems)
            .where(inArray(orderItems.orderId, orderIds))
            .groupBy(orderItems.orderId)
        : [];

    const itemCountMap = new Map(itemCounts.map((ic) => [ic.orderId, ic.count]));

    const summaries: OrderSummary[] = result.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      totalAmount: (o.amounts as { total: number }).total,
      currency: o.currency,
      itemCount: itemCountMap.get(o.id) || 0,
      createdAt: o.createdAt,
    }));

    return {
      orders: summaries,
      total: countResult[0]?.count || 0,
    };
  }

  async updateStatus(
    storeId: string,
    orderId: string,
    status: OrderStatus,
    options?: RepositoryOptions,
  ): Promise<Order | null> {
    const executor = this.resolveExecutor(options);
    const result = await executor
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
      .returning();

    if (result.length === 0) return null;

    return this.findByIdWithItems(storeId, orderId, options);
  }

  async cancel(storeId: string, orderId: string, options?: RepositoryOptions): Promise<boolean> {
    const executor = this.resolveExecutor(options);
    const result = await executor
      .update(orders)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.storeId, storeId),
          inArray(orders.status, ["pending", "confirmed"]),
        ),
      )
      .returning({ id: orders.id });

    return result.length > 0;
  }
}
