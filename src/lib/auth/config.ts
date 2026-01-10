
export function isGoogleOAuthEnabled(): boolean {
	if (typeof window === "undefined") {
		return !!(
			process.env.BETTER_AUTH_GOOGLE_CLIENT_ID &&
			process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET
		);
	}
	return true;
}


export async function checkGoogleOAuthEnabled(): Promise<boolean> {
	try {
		const response = await fetch("/api/auth/check-providers");
		const data = await response.json();
		return data.google === true;
	} catch {
		return false;
	}
}
