import { z } from "zod";
import { createOrderSchema, orderQuerySchema } from "@/lib/domains/orders";

export const orderListQuerySchema = orderQuerySchema.extend({
  userId: z.string().optional(),
});

export const createStoreOrderBodySchema = createOrderSchema;

export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type CreateStoreOrderBody = z.infer<typeof createStoreOrderBodySchema>;
