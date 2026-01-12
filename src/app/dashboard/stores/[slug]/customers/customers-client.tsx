"use client";

import { Users } from 'lucide-react';
import AdminCustomersList from '@/components/features/dashboard/admin-customers-list';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import { RefreshButton } from '@/components/shared/common/refresh-button';
import { useCustomers } from '@/hooks/queries/use-customers';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';

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
    <DashboardLayout
      title="Customers"
      desc="View and manage your store customers"
      icon={<Users />}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: storeName || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Customers' },
      ]}
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
    </DashboardLayout>
  );
}
