import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema/auth';
import { nextCookies } from 'better-auth/next-js';

const googleClientId = process.env.BETTER_AUTH_GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET;

const hasGoogleConfig = !!(googleClientId && googleClientSecret);

const authConfig: Parameters<typeof betterAuth>[0] = {
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [nextCookies()],
};

// Only add socialProviders if Google is configured
if (hasGoogleConfig) {
	authConfig.socialProviders = {
		google: {
			clientId: googleClientId!,
			clientSecret: googleClientSecret!,
		},
	};
}

export const auth = betterAuth(authConfig);
