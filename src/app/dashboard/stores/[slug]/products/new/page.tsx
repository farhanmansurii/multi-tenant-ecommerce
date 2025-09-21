import type { Metadata } from "next";
import StoreProductCreate from "@/components/features/dashboard/store-product-create";
import { generateDashboardMetadata } from "@/lib/metadata";

interface StoreProductCreatePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  return generateDashboardMetadata("products", {
    title: `Create Product - ${slug}`,
    description: `Add a new product to your store "${slug}". Create detailed product listings with images, descriptions, pricing, and inventory management.`,
    keywords: ["create product", "add product", "product management", "inventory", "ecommerce", slug],
  });
}

export default function StoreProductCreatePage({ params }: StoreProductCreatePageProps) {
  return <StoreProductCreate params={Promise.resolve(params)} />;
}
