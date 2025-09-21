import { pgTable, unique, text, jsonb, boolean, numeric, timestamp, foreignKey, integer, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const productStatus = pgEnum("product_status", ['draft', 'active', 'inactive', 'out_of_stock'])
export const productType = pgEnum("product_type", ['physical', 'digital', 'service'])
export const storeStatus = pgEnum("store_status", ['draft', 'active', 'suspended'])


export const stores = pgTable("stores", {
	id: text().primaryKey().notNull(),
	ownerId: text("owner_id").notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	tagline: text(),
	description: text().notNull(),
	contactEmail: text("contact_email").notNull(),
	contactPhone: text("contact_phone"),
	website: text(),
	businessType: text("business_type").notNull(),
	businessName: text("business_name").notNull(),
	taxId: text("tax_id"),
	addressLine1: text("address_line1").notNull(),
	city: text().notNull(),
	state: text().notNull(),
	zipCode: text("zip_code").notNull(),
	country: text().notNull(),
	logo: text(),
	favicon: text(),
	primaryColor: text("primary_color").notNull(),
	secondaryColor: text("secondary_color"),
	currency: text().notNull(),
	timezone: text().notNull(),
	language: text().notNull(),
	paymentMethods: jsonb("payment_methods").default([]).notNull(),
	shippingEnabled: boolean("shipping_enabled").default(true).notNull(),
	freeShippingThreshold: numeric("free_shipping_threshold"),
	shippingRates: jsonb("shipping_rates").default([]),
	termsOfService: text("terms_of_service").notNull(),
	privacyPolicy: text("privacy_policy").notNull(),
	refundPolicy: text("refund_policy").notNull(),
	status: storeStatus().default('draft').notNull(),
	featured: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("stores_slug_unique").on(table.slug),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const products = pgTable("products", {
	id: text().primaryKey().notNull(),
	storeId: text("store_id").notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text().notNull(),
	shortDescription: text("short_description"),
	sku: text(),
	type: productType().default('physical').notNull(),
	status: productStatus().default('draft').notNull(),
	price: numeric().notNull(),
	compareAtPrice: numeric("compare_at_price"),
	costPrice: numeric("cost_price"),
	trackQuantity: boolean("track_quantity").default(true).notNull(),
	quantity: numeric().default('0').notNull(),
	allowBackorder: boolean("allow_backorder").default(false).notNull(),
	weight: numeric(),
	length: numeric(),
	width: numeric(),
	height: numeric(),
	downloadUrl: text("download_url"),
	downloadExpiry: numeric("download_expiry"),
	metaTitle: text("meta_title"),
	metaDescription: text("meta_description"),
	images: jsonb().default([]),
	variants: jsonb().default([]),
	categories: jsonb().default([]),
	tags: jsonb().default([]),
	featured: boolean().default(false).notNull(),
	requiresShipping: boolean("requires_shipping").default(true).notNull(),
	taxable: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
});

export const categories = pgTable("categories", {
	id: text().primaryKey().notNull(),
	storeId: text("store_id").notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	image: text(),
	color: text(),
	isActive: boolean("is_active").default(true),
	sortOrder: integer("sort_order").default(0),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const tags = pgTable("tags", {
	id: text().primaryKey().notNull(),
	storeId: text("store_id").notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	color: text(),
	isActive: boolean("is_active").default(true),
	usageCount: integer("usage_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
