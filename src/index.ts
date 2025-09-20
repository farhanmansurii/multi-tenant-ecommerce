import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    const client = postgres(process.env.DATABASE_URL);
    drizzle({ client });
}

main();
