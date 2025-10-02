import { NextResponse } from 'next/server';

import { storeHelpers } from '@/lib/domains/stores';
import { productHelpers } from '@/lib/domains/products';
import { db } from '@/lib/db';
import { products as productsTable } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

export async function GET(request: Request, { params }: RouteParams) {
	const { slug } = await params;

	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: 'Store not found' }, { status: 404 });
	}

	type ProductRow = typeof productsTable.$inferSelect;

	const rows: ProductRow[] = await db
		.select()
		.from(productsTable)
		.where(eq(productsTable.storeId, store.id))
		.orderBy(desc(productsTable.createdAt));

	const total = rows.length;
	const products = rows;

	return NextResponse.json({
		store: { id: store.id, slug: store.slug, name: store.name },
		products,
		total,
	});
}

export async function POST(request: Request, { params }: RouteParams) {
	const { slug } = await params;
	const store = await storeHelpers.getStoreBySlug(slug);
	if (!store) {
		return NextResponse.json({ error: 'Store not found' }, { status: 404 });
	}

	const body = await request.json();

	function toSlug(input: string): string {
		return input
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-zA-Z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.toLowerCase();
	}

	let finalSlug: string | undefined = body.slug;
	if (!finalSlug) {
		const base =
			typeof body.name === 'string' && body.name.trim().length > 0
				? body.name
				: crypto.randomUUID();
		let candidate = toSlug(base);
		if (candidate.length === 0) candidate = crypto.randomUUID();
		let unique = candidate;
		let i = 1;
		while (true) {
			const exists = await productHelpers.getProductBySlug(store.id, unique);
			if (!exists) break;
			unique = `${candidate}-${++i}`;
		}
		finalSlug = unique;
	}

	const product = await productHelpers.createProduct(store.id, { ...body, slug: finalSlug });
	return NextResponse.json({ product }, { status: 201 });
}
