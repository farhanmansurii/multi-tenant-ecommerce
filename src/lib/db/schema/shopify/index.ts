import { pgTable, text, timestamp, jsonb, boolean, pgEnum, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const shopifySyncStatusEnum = pgEnum("shopify_sync_status", ["idle", "syncing", "error"]);

export const shopifyConfigs = pgTable("shopify_configs", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull(),
  domain: text("domain").notNull(), // e.g., mystore.myshopify.com
  accessToken: text("access_token").notNull(), // Admin API access token
  apiVersion: text("api_version").notNull().default("2023-10"),
  webhookSecret: text("webhook_secret"), // For verifying webhooks
  enabled: boolean("enabled").notNull().default(false),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  syncStatus: shopifySyncStatusEnum("sync_status").notNull().default("idle"),
  settings: jsonb("settings").$type<{
    syncProducts: boolean;
    syncInventory: boolean;
    syncOrders: boolean;
    autoPublish: boolean;
  }>().default(sql`'{"syncProducts": true, "syncInventory": true, "syncOrders": false, "autoPublish": false}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  sql`UNIQUE(${table.storeId})`,
]);

export const shopifyProductMappings = pgTable("shopify_product_mappings", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull(),
  shopifyProductId: text("shopify_product_id").notNull(),
  localProductId: text("local_product_id").notNull(),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  sql`UNIQUE(${table.storeId}, ${table.shopifyProductId})`,
  sql`UNIQUE(${table.storeId}, ${table.localProductId})`,
]);

export const shopifyVariantMappings = pgTable("shopify_variant_mappings", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull(),
  shopifyVariantId: text("shopify_variant_id").notNull(),
  localVariantId: text("local_variant_id").notNull(),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  sql`UNIQUE(${table.storeId}, ${table.shopifyVariantId})`,
  sql`UNIQUE(${table.storeId}, ${table.localVariantId})`,
]);

// Analytics tables
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
