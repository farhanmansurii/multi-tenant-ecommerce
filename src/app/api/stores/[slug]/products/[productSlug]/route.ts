import { NextResponse } from "next/server";

import { storeHelpers } from "@/lib/domains/stores";
import { productHelpers } from "@/lib/domains/products";

interface RouteParams {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug, productSlug } = await params;

  const store = await storeHelpers.getStoreBySlug(slug);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // TODO: add getProductBySlug helper; for now, return 501
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
