"use client";

import { Package } from 'lucide-react';
import ProductManager from '@/components/shared/common/product-manager';
import { RefreshButton } from '@/components/shared/common/refresh-button';
import { useProducts } from '@/hooks/queries/use-products';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { StoreSectionShell } from '@/components/features/dashboard/store-section-shell';

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
    <StoreSectionShell
      slug={slug}
      storeName={storeName}
      title="Products"
      desc="Manage your product catalog"
      icon={<Package />}
      headerActions={
        <RefreshButton
          onRefresh={handleRefresh}
          isRefreshing={isRefetching}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
        />
      }
    >
      <ProductManager storeSlug={slug} />
    </StoreSectionShell>
  );
}
