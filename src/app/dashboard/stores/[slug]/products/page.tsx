import { Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import ProductManager from '@/components/shared/common/product-manager';
import { getStoreBySlug } from '@/lib/domains/stores/helpers';
import { ProductsPageClient } from './products-client';

interface ProductsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  return <ProductsPageClient slug={slug} storeName={store?.name} />;
}
