import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema/auth';
import { nextCookies } from 'better-auth/next-js';

// Normalize baseURL - remove trailing slashes
const baseURL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '');

const authConfig: Parameters<typeof betterAuth>[0] = {
	baseURL,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: schema,
	}),
	emailAndPassword: {
		enabled: false,
	},
	plugins: [nextCookies()],
};

// Configure social providers
// Better Auth automatically constructs the redirectURI as: {baseURL}/api/auth/callback/{provider}
const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};

if (process.env.BETTER_AUTH_GOOGLE_CLIENT_ID && process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET) {
	socialProviders.google = {
		clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID,
		clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
	};
}

if (process.env.BETTER_AUTH_GITHUB_CLIENT_ID && process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET) {
	socialProviders.github = {
		clientId: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
		clientSecret: process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
	};
}

if (process.env.BETTER_AUTH_MICROSOFT_CLIENT_ID && process.env.BETTER_AUTH_MICROSOFT_CLIENT_SECRET) {
	socialProviders.microsoft = {
		clientId: process.env.BETTER_AUTH_MICROSOFT_CLIENT_ID,
		clientSecret: process.env.BETTER_AUTH_MICROSOFT_CLIENT_SECRET,
	};
}

if (process.env.BETTER_AUTH_APPLE_CLIENT_ID && process.env.BETTER_AUTH_APPLE_CLIENT_SECRET) {
	socialProviders.apple = {
		clientId: process.env.BETTER_AUTH_APPLE_CLIENT_ID,
		clientSecret: process.env.BETTER_AUTH_APPLE_CLIENT_SECRET,
	};
}

if (process.env.BETTER_AUTH_DISCORD_CLIENT_ID && process.env.BETTER_AUTH_DISCORD_CLIENT_SECRET) {
	socialProviders.discord = {
		clientId: process.env.BETTER_AUTH_DISCORD_CLIENT_ID,
		clientSecret: process.env.BETTER_AUTH_DISCORD_CLIENT_SECRET,
	};
}

if (Object.keys(socialProviders).length > 0) {
	authConfig.socialProviders = socialProviders;
}

export const auth = betterAuth(authConfig);
