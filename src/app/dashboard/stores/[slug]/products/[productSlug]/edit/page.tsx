import type { Metadata } from "next";

import { generateDashboardMetadata } from "@/lib/metadata";
import { StoreProductEdit } from "@/components";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; productSlug: string }> }): Promise<Metadata> {
  const { slug, productSlug } = await params;

  return generateDashboardMetadata("products", {
    title: `Edit Product - ${productSlug}`,
    description: `Edit product "${productSlug}" in your store "${slug}". Update product details, pricing, images, and inventory information.`,
    keywords: ["edit product", "product management", "update product", "inventory", "ecommerce", slug, productSlug],
  });
}

export default function StoreProductEditPage({
  params,
}: {
  params: { slug: string; productSlug: string };
}) {
  return <StoreProductEdit params={params} />;
}
