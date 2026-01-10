import type { Metadata } from "next";
import StoreProductCreate from "@/components/features/dashboard/store-product-create";
import { generateDashboardMetadata } from "@/lib/metadata";

interface StoreProductCreatePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  return generateDashboardMetadata("products", {
    title: `Create Product - ${slug}`,
    description: `Add a new product to your store "${slug}". Create detailed product listings with images, descriptions, pricing, and inventory management.`,
    keywords: ["create product", "add product", "product management", "inventory", "ecommerce", slug],
  });
}

import { Package } from 'lucide-react';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import { getStoreBySlug } from '@/lib/domains/stores/helpers';

export default async function StoreProductCreatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  return (
    <DashboardLayout
      title="Create Product"
      desc="Add a new product to your store"
      icon={<Package />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Products', href: `/dashboard/stores/${slug}/products` },
        { label: 'Create' },
      ]}
    >
      <StoreProductCreate params={Promise.resolve({ slug })} />
    </DashboardLayout>
  );
}
