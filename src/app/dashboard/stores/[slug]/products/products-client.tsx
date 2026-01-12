"use client";

import { Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import ProductManager from '@/components/shared/common/product-manager';
import { RefreshButton } from '@/components/shared/common/refresh-button';
import { useProducts } from '@/hooks/queries/use-products';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';

interface ProductsPageClientProps {
  slug: string;
  storeName?: string;
}

export function ProductsPageClient({ slug, storeName }: ProductsPageClientProps) {
  const queryClient = useQueryClient();
  const { refetch, isRefetching } = useProducts(slug);

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all(slug) });
  };

  return (
    <DashboardLayout
      title="Products"
      desc="Manage your store products"
      icon={<Package />}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: storeName || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Products' },
      ]}
      headerActions={
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <RefreshButton
            onRefresh={handleRefresh}
            isRefreshing={isRefetching}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          />
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/dashboard/stores/${slug}/products/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      }
    >
      <ProductManager storeSlug={slug} />
    </DashboardLayout>
  );
}
