import { NextResponse, type NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { withStoreContext } from '@/lib/api/handlers';

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	const { slug } = await params;

	const ctx = await withStoreContext<{ storeId: string }>(request, slug);

	if (!(ctx as unknown as { storeId?: string }).storeId) return ctx as unknown as Response;

	const { storeId } = ctx as { storeId: string };

	const rows = await db
		.select()
		.from(categories)
		.where(and(eq(categories.storeId, storeId), eq(categories.isActive, true)))
		.orderBy(categories.sortOrder);

	return NextResponse.json({ categories: rows });
}
