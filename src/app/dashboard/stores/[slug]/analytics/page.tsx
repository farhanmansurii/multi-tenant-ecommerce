import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { generateDashboardMetadata } from "@/lib/metadata";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { getStoreBySlug } from "@/lib/domains/stores/helpers";
import { AnalyticsDashboard } from "@/components/features/dashboard/analytics-dashboard";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  return generateDashboardMetadata("analytics", {
    title: `Analytics - ${slug}`,
    description: `View detailed analytics and insights for your store "${slug}" including sales performance, customer behavior, and conversion metrics.`,
    keywords: ["analytics", "insights", "performance", "sales", "conversion", "metrics", slug],
  });
}

export default async function AnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  return (
    <DashboardLayout
      title="Analytics"
      desc="Track your store's performance and customer insights"
      icon={<BarChart3 />}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Analytics' },
      ]}
    >
      <AnalyticsDashboard params={params} />
    </DashboardLayout>
  );
}
