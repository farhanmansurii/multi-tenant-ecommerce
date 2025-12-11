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

// Initiate checkout
export const initiateCheckoutSchema = z.object({
	cartId: z.string().min(1, "Cart ID is required"),
	customerId: z.string().min(1, "Customer ID is required"),
	shippingAddress: addressSchema,
	billingAddress: addressSchema.optional(),
	discountCode: z.string().optional(),
});

// Confirm checkout (process payment)
export const confirmCheckoutSchema = z.object({
	orderId: z.string().min(1, "Order ID is required"),
	paymentMethod: z.enum(["stripe", "upi", "cod", "bank_transfer"]).default("cod"),
	// For mock payments, no actual payment details needed
});

export type InitiateCheckoutInput = z.infer<typeof initiateCheckoutSchema>;
export type ConfirmCheckoutInput = z.infer<typeof confirmCheckoutSchema>;
