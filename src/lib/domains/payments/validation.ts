import { z } from "zod";

// Create payment
export const createPaymentSchema = z.object({
	orderId: z.string().min(1, "Order ID is required"),
	amountCents: z.number().int().positive("Amount must be positive"),
	currency: z.string().default("INR"),
	method: z.enum(["stripe", "paypal", "upi", "cod", "bank_transfer"]),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
