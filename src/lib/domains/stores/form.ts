import { StoreData, StoreFormPayload, StoreSettings } from "./types";
import { StoreFormData } from "./validation";

const baseDefaults: StoreFormData = {
	storeName: "",
	storeSlug: "",
	description: "",
	email: "",
	logo: "",
	primaryColor: "#3B82F6",
	currency: "USD",
	paymentMethods: ["cod"],
	codEnabled: true,
	shippingEnabled: true,
	freeShippingThreshold: undefined,
	termsOfService: "",
	privacyPolicy: "",
	refundPolicy: "",
};

export function buildStoreFormState(
	overrides?: Partial<StoreFormData>
): StoreFormData {
	return {
		...baseDefaults,
		...overrides,
		paymentMethods: overrides?.paymentMethods?.length
			? overrides.paymentMethods
			: baseDefaults.paymentMethods,
	};
}

export function storeDataToFormValues(store?: StoreData | null): StoreFormData {
	if (!store) return buildStoreFormState();
	const settings: StoreSettings = store.settings || {};
	return buildStoreFormState({
		storeName: store.name ?? "",
		storeSlug: store.slug ?? "",
		description: store.description ?? "",
		email: store.contactEmail ?? "",
		logo: store.logo ?? "",
		primaryColor: store.primaryColor ?? baseDefaults.primaryColor,
		currency: store.currency ?? baseDefaults.currency,
		paymentMethods: settings.paymentMethods && settings.paymentMethods.length
			? settings.paymentMethods
			: store.paymentMethods ?? baseDefaults.paymentMethods,
		codEnabled:
			typeof settings.codEnabled === "boolean"
				? settings.codEnabled
				: typeof store.codEnabled === "boolean"
					? store.codEnabled
					: baseDefaults.codEnabled,
		shippingEnabled:
			typeof settings.shippingEnabled === "boolean"
				? settings.shippingEnabled
				: typeof store.shippingEnabled === "boolean"
					? store.shippingEnabled
					: baseDefaults.shippingEnabled,
		freeShippingThreshold:
			typeof settings.freeShippingThreshold === "number"
				? settings.freeShippingThreshold
				: typeof store.freeShippingThreshold === "number"
					? Number(store.freeShippingThreshold)
					: undefined,
		termsOfService: settings.termsOfService ?? store.termsOfService ?? "",
		privacyPolicy: settings.privacyPolicy ?? store.privacyPolicy ?? "",
		refundPolicy: settings.refundPolicy ?? store.refundPolicy ?? "",
	});
}

export function storeFormValuesToPayload(
	values: StoreFormData,
	base?: StoreData | null
): StoreFormPayload {
	return {
		storeName: values.storeName.trim(),
		storeSlug: values.storeSlug.trim(),
		description: values.description.trim(),
		email: values.email.trim(),
		logo: values.logo || undefined,
		primaryColor: values.primaryColor,
		currency: values.currency,
		paymentMethods: values.paymentMethods,
		codEnabled: values.codEnabled,
		shippingEnabled: values.shippingEnabled,
		freeShippingThreshold: values.freeShippingThreshold,
		termsOfService: values.termsOfService,
		privacyPolicy: values.privacyPolicy,
		refundPolicy: values.refundPolicy,
		status: base?.status ?? "draft",
		featured: base?.featured ?? false,
	};
}

export type { StoreFormData };
