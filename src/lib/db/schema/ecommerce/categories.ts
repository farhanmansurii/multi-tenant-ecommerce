import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const categories = pgTable('categories', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	storeId: text('store_id').notNull(),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	description: text('description'),
	image: text('image'),
	color: text('color'),
	isActive: boolean('is_active').default(true),
	sortOrder: integer('sort_order').default(0),
	metadata: jsonb('metadata'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tags = pgTable('tags', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	storeId: text('store_id').notNull(),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	color: text('color'),
	isActive: boolean('is_active').default(true),
	usageCount: integer('usage_count').default(0),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
