import { pgTable, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Storefront analytics (not tied to any integration)
export const analyticsEvents = pgTable("analytics_events", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull(),
  eventType: text("event_type").notNull(), // 'view_product', 'add_to_cart', 'checkout_start', 'purchase'
  userId: text("user_id"), // null for anonymous users
  sessionId: text("session_id").notNull(),
  productId: text("product_id"),
  variantId: text("variant_id"),
  orderId: text("order_id"),
  quantity: integer("quantity"),
  value: integer("value_cents"), // in cents
  currency: text("currency").default("INR"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default(sql`'{}'::jsonb`),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  referrer: text("referrer"),
  url: text("url"),
});

