import { relations, sql } from "drizzle-orm";
import {
	boolean,
	numeric,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const productStatusEnum = pgEnum("product_status", ["draft", "active", "inactive", "out_of_stock"]);
export const productTypeEnum = pgEnum("product_type", ["physical", "digital", "service"]);

export type ProductImage = {
	id: string;
	url: string;
	alt: string;
	isPrimary: boolean;
};

// ProductVariant type moved to product-variant.ts

export const products = pgTable("products", {
	id: text("id").primaryKey(),
	storeId: text("store_id").notNull(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	description: text("description").notNull(),
	shortDescription: text("short_description"),
	sku: text("sku"),
	type: productTypeEnum("type").notNull().default("physical"),
	status: productStatusEnum("status").notNull().default("draft"),

	// Pricing
	price: numeric("price").notNull(),
	compareAtPrice: numeric("compare_at_price"),
	costPrice: numeric("cost_price"),

	// Inventory
	trackQuantity: boolean("track_quantity").notNull().default(true),
	quantity: numeric("quantity").notNull().default("0"),
	allowBackorder: boolean("allow_backorder").notNull().default(false),

	// Physical product details
	weight: numeric("weight"),
	length: numeric("length"),
	width: numeric("width"),
	height: numeric("height"),

	// Digital product details
	downloadUrl: text("download_url"),
	downloadExpiry: numeric("download_expiry"), // days

	// SEO
	metaTitle: text("meta_title"),
	metaDescription: text("meta_description"),

	// Media
	images: jsonb("images")
		.$type<ProductImage[]>()
		.default(sql`'[]'::jsonb`),

	// Variants are now in separate product_variants table

	// Categories and tags
	categories: jsonb("categories")
		.$type<string[]>()
		.default(sql`'[]'::jsonb`),
	tags: jsonb("tags")
		.$type<string[]>()
		.default(sql`'[]'::jsonb`),

	// Settings
	featured: boolean("featured").notNull().default(false),
	requiresShipping: boolean("requires_shipping").notNull().default(true),
	taxable: boolean("taxable").notNull().default(true),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	publishedAt: timestamp("published_at", { withTimezone: true }),
});

