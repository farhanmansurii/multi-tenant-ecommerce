import * as z from "zod";

const shippingRateSchema = z.object({
	name: z.string(),
	price: z.number().min(0),
	estimatedDays: z.string(),
});

const heroImageSchema = z.object({
	id: z.string().optional(),
	url: z.string(),
	name: z.string().optional(),
	size: z.number().optional(),
});

export const storeSchema = z.object({
	storeName: z
		.string()
		.min(2, "Store name must be at least 2 characters")
		.max(50, "Store name must be less than 50 characters"),
	storeSlug: z
		.string()
		.min(2, "Store URL must be at least 2 characters")
		.max(30, "Store URL must be less than 30 characters")
		.regex(/^[a-z0-9-]+$/, "Store URL can only contain lowercase letters, numbers, and hyphens"),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(500, "Description must be less than 500 characters"),
	tagline: z
		.string()
		.max(100, "Tagline must be less than 100 characters")
		.optional()
		.or(z.literal("")),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().optional().or(z.literal("")),
	website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
	businessType: z.enum(["individual", "business", "nonprofit"]).default("individual"),
	businessName: z.string().min(2, "Business name must be at least 2 characters"),
	taxId: z.string().optional().or(z.literal("")),
	address: z.string().min(2, "Address must be at least 2 characters").optional().or(z.literal("")),
	city: z.string().min(2, "City must be at least 2 characters").optional().or(z.literal("")),
	state: z.string().min(2, "State must be at least 2 characters").optional().or(z.literal("")),
	zipCode: z.string().min(3, "ZIP code must be at least 3 characters").optional().or(z.literal("")),
	country: z.string().min(2, "Country must be at least 2 characters").optional().or(z.literal("")),
	logo: z.string().optional().or(z.literal("")),
	favicon: z.string().optional().or(z.literal("")),
	heroImages: z.array(heroImageSchema).optional(),
	primaryColor: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Please enter a valid hex color code"),
	secondaryColor: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Please enter a valid hex color code")
		.optional(),
	currency: z.string().min(3, "Please select a currency"),
	timezone: z.string().min(1, "Please select a timezone"),
	language: z.string().min(2, "Please select a language"),
	paymentMethods: z.array(z.string()).min(1, "Please select at least one payment method"),
	upiId: z.string().optional().or(z.literal("")),
	codEnabled: z.boolean(),
	stripeAccountId: z.string().optional().or(z.literal("")),
	paypalEmail: z.string().email("Please enter a valid PayPal email").optional().or(z.literal("")),
	shippingEnabled: z.boolean(),
	freeShippingThreshold: z.number().min(0, "Free shipping threshold must be positive").optional(),
	shippingRates: z.array(shippingRateSchema).optional(),
	termsOfService: z.string().min(10, "Terms of service must be at least 10 characters"),
	privacyPolicy: z.string().min(10, "Privacy policy must be at least 10 characters"),
	refundPolicy: z.string().min(10, "Refund policy must be at least 10 characters"),
});

export type StoreFormData = z.infer<typeof storeSchema>;
