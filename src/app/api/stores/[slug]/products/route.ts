import { NextResponse } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import { productHelpers } from "@/lib/domains/products";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const products = await productHelpers.listProductsWithContext(store.id);
  return NextResponse.json({ store: { id: store.id, slug: store.slug, name: store.name }, products });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await request.json();
  const product = await productHelpers.createProduct(store.id, body);
  return NextResponse.json({ product }, { status: 201 });
}
