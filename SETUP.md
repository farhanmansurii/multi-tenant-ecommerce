# Multi-Tenant Ecommerce Setup

This project is a multi-tenant ecommerce platform built with Next.js, Drizzle ORM, and PostgreSQL.

## Prerequisites

- Node.js 18+
- PostgreSQL database

## Environment Setup

1. Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

## Database Setup

1. Install dependencies:
```bash
npm install
```

2. Generate and run database migrations:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- Multi-tenant store creation and management
- Store configuration and customization
- Product management (coming soon)
- Order management (coming soon)

## Database Schema

The application currently uses the following table:
- `stores` - Multi-tenant stores with full configuration

## Troubleshooting

### Database Connection Issues
- Ensure your `DATABASE_URL` is correct
- Check that your PostgreSQL server is running
- Verify database credentials

### Migration Issues
- Delete the `drizzle/` folder and regenerate migrations
- Ensure database schema matches the expected structure
