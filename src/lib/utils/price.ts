export function formatPrice(
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
