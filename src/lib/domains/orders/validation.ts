import { z } from "zod";

const addressSchema = z.object({
	recipient: z.string().min(1, "Recipient name is required"),
	line1: z.string().min(1, "Address line 1 is required"),
	line2: z.string().optional(),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	postalCode: z.string().min(1, "Postal code is required"),
	country: z.string().min(1, "Country is required"),
	phone: z.string().optional(),
});

// Create order from cart
export const createOrderSchema = z.object({
	cartId: z.string().min(1, "Cart ID is required"),
	customerId: z.string().min(1, "Customer ID is required"),
	shippingAddress: addressSchema,
	billingAddress: addressSchema.optional(),
	discountCode: z.string().optional(),
});

// Update order status
export const updateOrderStatusSchema = z.object({
	status: z.enum([
		"pending",
		"confirmed",
		"processing",
		"shipped",
		"delivered",
		"cancelled",
		"refunded",
	]),
});

// Order list query params
export const orderQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	status: z.enum([
		"pending",
		"confirmed",
		"processing",
		"shipped",
		"delivered",
		"cancelled",
		"refunded",
	]).optional(),
	customerId: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
