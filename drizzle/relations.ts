import { relations } from "drizzle-orm/relations";
import {
  user,
  account,
  session,
  stores,
  products,
  productVariants,
  categories,
  tags,
  orders,
  orderItems,
  payments,
  storeCustomers,
} from "./schema";

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const storeRelations = relations(stores, ({ many }) => ({
  customers: many(storeCustomers),
  products: many(products),
  variants: many(productVariants),
  categories: many(categories),
  tags: many(tags),
  orders: many(orders),
  payments: many(payments),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  variants: many(productVariants),
}));

export const productVariantRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  store: one(stores, {
    fields: [productVariants.storeId],
    references: [stores.id],
  }),
}));

export const categoryRelations = relations(categories, ({ one }) => ({
  store: one(stores, {
    fields: [categories.storeId],
    references: [stores.id],
  }),
}));

export const tagRelations = relations(tags, ({ one }) => ({
  store: one(stores, {
    fields: [tags.storeId],
    references: [stores.id],
  }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
  customer: one(storeCustomers, {
    fields: [orders.customerId],
    references: [storeCustomers.id],
  }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  store: one(stores, {
    fields: [orderItems.storeId],
    references: [stores.id],
  }),
}));

export const storeCustomerRelations = relations(storeCustomers, ({ one, many }) => ({
  store: one(stores, {
    fields: [storeCustomers.storeId],
    references: [stores.id],
  }),
  orders: many(orders),
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  store: one(stores, {
    fields: [payments.storeId],
    references: [stores.id],
  }),
}));
