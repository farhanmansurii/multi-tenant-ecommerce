"use client";

import { BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { AnalyticsDashboard } from "@/components/features/dashboard/analytics-dashboard";
import { RefreshButton } from "@/components/shared/common/refresh-button";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { useCallback } from "react";

interface AnalyticsPageClientProps {
  slug: string;
  storeName?: string;
  params: Promise<{ slug: string }>;
}

export function AnalyticsPageClient({ slug, storeName, params }: AnalyticsPageClientProps) {
  const queryClient = useQueryClient();
  const isFetchingAnalytics = useIsFetching({ queryKey: ["analytics", slug] }) > 0;
  const isFetchingActivity = useIsFetching({ queryKey: ["recent-activity", slug] }) > 0;
  const isRefreshing = isFetchingAnalytics || isFetchingActivity;

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["analytics", slug] });
    queryClient.invalidateQueries({ queryKey: ["recent-activity", slug] });
  }, [queryClient, slug]);

  return (
    <DashboardLayout
      title="Analytics"
      desc="Track your store's performance and customer insights"
      icon={<BarChart3 />}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: storeName || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Analytics' },
      ]}
      headerActions={
        <RefreshButton
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          variant="outline"
          size="sm"
        />
      }
    >
      <AnalyticsDashboard params={params} />
    </DashboardLayout>
  );
}
