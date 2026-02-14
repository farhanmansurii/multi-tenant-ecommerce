"use client";

import { ClipboardList } from 'lucide-react';
import { Suspense } from 'react';
import AdminOrdersList from '@/components/features/dashboard/admin-orders-list';
import { Loader } from '@/components/shared/common/loader';
import { RefreshButton } from '@/components/shared/common/refresh-button';
import { useOrders } from '@/hooks/queries/use-orders';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { StoreSectionShell } from '@/components/features/dashboard/store-section-shell';

interface OrdersPageClientProps {
  slug: string;
  storeName?: string;
}

export function OrdersPageClient({ slug, storeName }: OrdersPageClientProps) {
  const queryClient = useQueryClient();
  const { refetch, isRefetching } = useOrders(slug);

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(slug) });
  };

  return (
    <StoreSectionShell
      slug={slug}
      storeName={storeName}
      title="Orders"
      desc="View and manage customer orders"
      icon={<ClipboardList />}
      headerActions={
        <RefreshButton
          onRefresh={handleRefresh}
          isRefreshing={isRefetching}
          variant="outline"
          size="sm"
        />
      }
    >
      <Suspense fallback={<Loader text="Loading orders..." className="py-24" />}>
        <AdminOrdersList storeSlug={slug} />
      </Suspense>
    </StoreSectionShell>
  );
}
