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

import { Package } from 'lucide-react';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import { getStoreBySlug } from '@/lib/domains/stores/helpers';

export default async function StoreProductEditPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;
  const store = await getStoreBySlug(slug);

  return (
    <DashboardLayout
      title="Edit Product"
      desc="Update product details"
      icon={<Package />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Products', href: `/dashboard/stores/${slug}/products` },
        { label: productSlug },
      ]}
    >
      <StoreProductEdit params={{ slug, productSlug }} />
    </DashboardLayout>
  );
}
