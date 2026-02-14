"use client";

import { Users } from 'lucide-react';
import AdminCustomersList from '@/components/features/dashboard/admin-customers-list';
import { RefreshButton } from '@/components/shared/common/refresh-button';
import { useCustomers } from '@/hooks/queries/use-customers';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { StoreSectionShell } from '@/components/features/dashboard/store-section-shell';

interface CustomersPageClientProps {
  slug: string;
  storeName?: string;
}

export function CustomersPageClient({ slug, storeName }: CustomersPageClientProps) {
  const queryClient = useQueryClient();
  const { refetch, isRefetching } = useCustomers(slug);

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all(slug) });
  };

  return (
    <StoreSectionShell
      slug={slug}
      storeName={storeName}
      title="Customers"
      desc="View and manage customers"
      icon={<Users />}
      headerActions={
        <RefreshButton
          onRefresh={handleRefresh}
          isRefreshing={isRefetching}
          variant="outline"
          size="sm"
        />
      }
    >
      <AdminCustomersList storeSlug={slug} />
    </StoreSectionShell>
  );
}
