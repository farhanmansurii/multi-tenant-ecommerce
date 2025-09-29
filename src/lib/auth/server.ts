import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema/auth';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET as string,
		},
	},
	plugins: [nextCookies()],
});
