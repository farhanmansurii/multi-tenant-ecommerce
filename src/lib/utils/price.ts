export function formatPrice(
	value: number | string | null | undefined,
	currency?: string
): string {
	const num = typeof value === 'number' ? value : parseFloat(String(value));
	if (isNaN(num)) return '';

	// Use provided currency or fallback to INR
	const currencyToUse = currency || 'INR';

	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currencyToUse,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num);
}

// Hook version that uses store settings
import { useStoreSettings } from '@/lib/state/store-settings/store-settings-store';

export function useFormatPrice() {
	const { getCurrency } = useStoreSettings();

	return (value: number | string | null | undefined, currency?: string) => {
		const num = typeof value === 'number' ? value : parseFloat(String(value));
		if (isNaN(num)) return '';

		// Use provided currency or store currency or fallback to INR
		const currencyToUse = currency || getCurrency() || 'INR';

		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currencyToUse,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(num);
	};
}

// Server-safe version that requires currency to be passed
export function formatPriceServer(
	value: number | string | null | undefined,
	currency: string = 'INR'
): string {
	const num = typeof value === 'number' ? value : parseFloat(String(value));
	if (isNaN(num)) return '';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num);
}
