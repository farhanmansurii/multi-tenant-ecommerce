import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { stores } from '../core/stores';

export const discounts = pgTable('discounts', {
	id: text('id').primaryKey(),
	storeId: text('store_id')
		.notNull()
		.references(() => stores.id, { onDelete: 'cascade' }),

	// Discount code
	code: text('code').notNull(),

	// Type: 'percentage' or 'fixed'
	type: text('type').notNull().default('percentage'),

	// Value (percentage 0-100, or fixed amount in cents)
	value: integer('value').notNull().default(0),

	// Minimum order amount in cents (optional)
	minOrderAmount: integer('min_order_amount'),

	// Maximum discount amount in cents (for percentage discounts)
	maxDiscountAmount: integer('max_discount_amount'),

	// Usage limits
	usageLimit: integer('usage_limit'), // null = unlimited
	usedCount: integer('used_count').notNull().default(0),
	usageLimitPerCustomer: integer('usage_limit_per_customer').default(1),

	// Validity
	startsAt: timestamp('starts_at', { withTimezone: true }),
	expiresAt: timestamp('expires_at', { withTimezone: true }),

	// Status
	isActive: boolean('is_active').notNull().default(true),

	// Optional: Applies to specific products/categories
	applicableTo: jsonb('applicable_to').$type<{
		type: 'all' | 'products' | 'categories';
		ids?: string[];
	}>(),

	// Metadata
	description: text('description'),

	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Discount = typeof discounts.$inferSelect;
export type NewDiscount = typeof discounts.$inferInsert;
