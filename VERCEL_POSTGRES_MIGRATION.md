# Migration Guide: Supabase to Vercel Postgres

This guide documents the migration from Supabase to Vercel Postgres while keeping Drizzle ORM.

## Changes Made

### 1. Database Connection (`src/lib/db/index.ts`)
- Updated to support both `DATABASE_URL` and `POSTGRES_URL` environment variables
- Enhanced SSL detection to automatically require SSL when:
  - Connection string includes `sslmode=require` or `sslmode=prefer`
  - Running in Vercel environment (`VERCEL_ENV` is set)
- Added connection pool configuration (`max: 10`) optimized for Vercel Postgres

### 2. Drizzle Configuration (`drizzle.config.ts`)
- Updated to support both `DATABASE_URL` and `POSTGRES_URL` environment variables

## Environment Variables

Set one of the following environment variables in your `.env.local` file or Vercel project settings:

```bash
# Option 1: Use DATABASE_URL (recommended)
DATABASE_URL="postgres://user:password@host:port/database?sslmode=require"

# Option 2: Use POSTGRES_URL (alternative)
POSTGRES_URL="postgres://user:password@host:port/database?sslmode=require"
```

### Vercel Postgres Connection String Format

When using Vercel Postgres, you can get your connection string from:
1. Vercel Dashboard → Your Project → Storage → Postgres → `.env.local`
2. Or use the Vercel CLI: `vercel env pull`

The connection string format will be:
```
postgres://default:password@host.vercel-storage.com:5432/verceldb?sslmode=require
```

## Migration Steps

1. **Update Environment Variables**
   - Set `DATABASE_URL` or `POSTGRES_URL` with your Vercel Postgres connection string
   - Ensure the connection string includes `?sslmode=require`

2. **Run Database Migrations**
   ```bash
   # Generate migration files (if schema changed)
   npx drizzle-kit generate

   # Apply migrations to Vercel Postgres
   npx drizzle-kit push
   ```

3. **Test the Connection**
   - Start your development server: `npm run dev`
   - Verify database queries work correctly
   - Check that SSL connection is established

## SSL Configuration

Vercel Postgres requires SSL connections. The updated configuration automatically:
- Detects SSL requirement from connection string (`sslmode=require`)
- Enables SSL when running in Vercel environment
- Falls back to production SSL requirement in production mode

## Connection Pooling

The connection pool is configured with `max: 10` connections, which is suitable for Vercel Postgres. Adjust if needed based on your usage patterns.

## Troubleshooting

### Connection Errors
- Ensure `sslmode=require` is in your connection string
- Verify credentials are correct
- Check that your IP is allowed (if using IP restrictions)

### SSL Errors
- The connection automatically enables SSL for Vercel Postgres
- If you see SSL errors, verify your connection string includes `sslmode=require`

### Migration Issues
- Ensure your Vercel Postgres database is accessible
- Run `npx drizzle-kit push` to sync schema
- Check migration files in `drizzle/` directory

## Next Steps

1. Update your production environment variables in Vercel Dashboard
2. Run migrations on production database
3. Test all database operations
4. Monitor connection health and performance
