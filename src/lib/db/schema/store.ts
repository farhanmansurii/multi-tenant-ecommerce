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

export const storeStatusEnum = pgEnum("store_status", ["draft", "active", "suspended"]);

export type ShippingRate = {
	name: string;
	price: number;
	estimatedDays: string;
};

export const stores = pgTable("stores", {
	id: text("id").primaryKey(),
	ownerId: text("owner_id").notNull(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	tagline: text("tagline"),
	description: text("description").notNull(),
	contactEmail: text("contact_email").notNull(),
	contactPhone: text("contact_phone"),
	website: text("website"),
	businessType: text("business_type").notNull(),
	businessName: text("business_name").notNull(),
	taxId: text("tax_id"),
	addressLine1: text("address_line1").notNull(),
	city: text("city").notNull(),
	state: text("state").notNull(),
	zipCode: text("zip_code").notNull(),
	country: text("country").notNull(),
	logo: text("logo"),
	favicon: text("favicon"),
	primaryColor: text("primary_color").notNull(),
	secondaryColor: text("secondary_color"),
	currency: text("currency").notNull(),
	timezone: text("timezone").notNull(),
	language: text("language").notNull(),
	paymentMethods: jsonb("payment_methods")
		.notNull()
		.$type<string[]>()
		.default(sql`'[]'::jsonb`),
	shippingEnabled: boolean("shipping_enabled").notNull().default(true),
	freeShippingThreshold: numeric("free_shipping_threshold"),
	shippingRates: jsonb("shipping_rates")
		.$type<ShippingRate[]>()
		.default(sql`'[]'::jsonb`),
	termsOfService: text("terms_of_service").notNull(),
	privacyPolicy: text("privacy_policy").notNull(),
	refundPolicy: text("refund_policy").notNull(),
	status: storeStatusEnum("status").notNull().default("draft"),
	featured: boolean("featured").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Relations removed - auth system removed

