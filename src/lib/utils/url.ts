const DEFAULT_BASE_URL = 'http://localhost:3000';

export const resolveBaseUrl = (): string => {
	const envUrl =
		process.env.NEXT_PUBLIC_APP_URL ||
		process.env.APP_URL ||
		(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

	return envUrl ? envUrl.replace(/\/+$/, '') : DEFAULT_BASE_URL;
};

export const withBaseUrl = (path: string): string =>
	typeof window === 'undefined' ? `${resolveBaseUrl()}${path}` : path;

