import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema/ecommerce/orders";
import { cartItems, carts } from "@/lib/db/schema/ecommerce/cart";
import { products } from "@/lib/db/schema/ecommerce/products";
import { discounts } from "@/lib/db/schema/ecommerce/discounts";
import type { Order, OrderItem, OrderSummary, OrderStatus } from "./types";
import type { CreateOrderInput, OrderQueryInput } from "./validation";

// Get next order number for a store
async function getNextOrderNumber(storeId: string): Promise<number> {
  const result = await db
    .select({ maxNumber: sql<number>`COALESCE(MAX(${orders.orderNumber}), 0)` })
    .from(orders)
    .where(eq(orders.storeId, storeId));

  return (result[0]?.maxNumber || 0) + 1;
}

// Create order from cart
export async function createOrder(storeId: string, input: CreateOrderInput): Promise<Order> {
  const { cartId, customerId, shippingAddress, billingAddress } = input;

  return await db.transaction(async (tx) => {
    // Get cart with items
    const cart = await tx
      .select()
      .from(carts)
      .where(and(eq(carts.id, cartId), eq(carts.storeId, storeId)))
      .limit(1);

    if (cart.length === 0) {
      throw new Error("Cart not found");
    }

    const items = await tx.select().from(cartItems).where(eq(cartItems.cartId, cartId));

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.unitPriceCents * item.qty, 0);
    const tax = Math.round(subtotal * 0.18); // 18% GST for India
    const shipping = 0; // Free shipping for now

    let discount = 0;
    if (input.discountCode) {
      const [discountRecord] = await tx
        .select()
        .from(discounts)
        .where(
          and(
            eq(discounts.storeId, storeId),
            eq(discounts.code, input.discountCode.toUpperCase()),
            eq(discounts.isActive, true),
          ),
        );

      if (discountRecord) {
        const now = new Date();
        const startsAt = discountRecord.startsAt ? new Date(discountRecord.startsAt) : null;
        const expiresAt = discountRecord.expiresAt ? new Date(discountRecord.expiresAt) : null;

        const isValid =
          (!startsAt || startsAt <= now) &&
          (!expiresAt || expiresAt >= now) &&
          (!discountRecord.usageLimit || discountRecord.usedCount < discountRecord.usageLimit) &&
          (!discountRecord.minOrderAmount || subtotal >= discountRecord.minOrderAmount);

        if (isValid) {
          if (discountRecord.type === "percentage") {
            let discountAmount = Math.round(subtotal * (discountRecord.value / 100));
            if (discountRecord.maxDiscountAmount) {
              discountAmount = Math.min(discountAmount, discountRecord.maxDiscountAmount);
            }
            discount = discountAmount;
          } else {
            discount = Math.min(discountRecord.value, subtotal);
          }
        }
      }
    }

    const total = Math.max(0, subtotal + tax + shipping - discount);

    // Get next order number using transaction
    const [orderNumberResult] = await tx
      .select({ maxNumber: sql<number>`COALESCE(MAX(${orders.orderNumber}), 0)` })
      .from(orders)
      .where(eq(orders.storeId, storeId));
    const orderNumber = (orderNumberResult?.maxNumber || 0) + 1;

    const orderId = createId();

    // Create order
    await tx.insert(orders).values({
      id: orderId,
      storeId,
      customerId,
      orderNumber,
      status: "pending",
      amounts: { subtotal, tax, shipping, discount, total },
      currency: cart[0].currency,
      paymentStatus: "pending",
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
    });

    // Create order items
    const orderItemsData = items.map((item) => ({
      id: createId(),
      storeId,
      orderId,
      productId: item.productId,
      variantId: item.variantId,
      qty: item.qty,
      unitPriceCents: item.unitPriceCents,
      totalPriceCents: item.unitPriceCents * item.qty,
    }));

    await tx.insert(orderItems).values(orderItemsData);

    // Mark cart as converted
    await tx
      .update(carts)
      .set({ status: "converted", updatedAt: new Date() })
      .where(eq(carts.id, cartId));

    // Return the created order
    const order = await tx
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
      .limit(1);

    if (order.length === 0) {
      throw new Error("Failed to create order");
    }

    const orderItemsWithProducts = await tx
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

    return {
      ...order[0],
      items: orderItemsWithProducts.map((row) => ({
        ...row.item,
        product: row.product
          ? {
              id: row.product.id,
              name: row.product.name,
              slug: row.product.slug,
              images: (row.product.images as Array<{ url: string; alt: string }>) || [],
            }
          : undefined,
      })),
    };
  });
}

// Get order by ID with items
export async function getOrderById(storeId: string, orderId: string): Promise<Order | null> {
  const orderResult = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
    .limit(1);

  if (orderResult.length === 0) return null;

  const order = orderResult[0];

  // Get order items with product info
  const items = await db
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

  const orderItemsWithProducts: OrderItem[] = items.map((row) => ({
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
    ...order,
    items: orderItemsWithProducts,
  };
}

// List orders with pagination
export async function listOrders(
  storeId: string,
  query: OrderQueryInput,
): Promise<{ orders: OrderSummary[]; total: number }> {
  const { page, limit, status, customerId } = query;
  const offset = (page - 1) * limit;

  const conditions = [eq(orders.storeId, storeId)];
  if (status) conditions.push(eq(orders.status, status));
  if (customerId) conditions.push(eq(orders.customerId, customerId));

  const whereClause = and(...conditions);

  const [result, countResult] = await Promise.all([
    db
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
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(orders)
      .where(whereClause),
  ]);

  const orderIds = result.map((o) => o.id);
  const itemCounts =
    orderIds.length > 0
      ? await db
          .select({
            orderId: orderItems.orderId,
            count: sql<number>`SUM(${orderItems.qty})::int`,
          })
          .from(orderItems)
          .where(inArray(orderItems.orderId, orderIds))
          .groupBy(orderItems.orderId)
      : [];

  const itemCountMap = new Map(itemCounts.map((ic) => [ic.orderId, ic.count]));

  const orderSummaries: OrderSummary[] = result.map((o) => ({
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
    orders: orderSummaries,
    total: countResult[0]?.count || 0,
  };
}

// Update order status
export async function updateOrderStatus(
  storeId: string,
  orderId: string,
  status: OrderStatus,
): Promise<Order | null> {
  const result = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
    .returning();

  if (result.length === 0) return null;

  return getOrderById(storeId, orderId);
}

// Cancel order (soft delete - status change)
export async function cancelOrder(storeId: string, orderId: string): Promise<boolean> {
  const result = await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.storeId, storeId),
        // Can only cancel pending or confirmed orders
        sql`${orders.status} IN ('pending', 'confirmed')`,
      ),
    )
    .returning({ id: orders.id });

  return result.length > 0;
}

// Get orders for a customer
export async function getCustomerOrders(
  storeId: string,
  customerId: string,
  limit = 10,
): Promise<OrderSummary[]> {
  const result = await listOrders(storeId, { page: 1, limit, customerId });
  return result.orders;
}
