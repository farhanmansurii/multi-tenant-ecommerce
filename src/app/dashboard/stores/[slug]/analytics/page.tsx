import type { Metadata } from "next";

import { generateDashboardMetadata } from "@/lib/metadata";
import { getStoreBySlug } from "@/lib/domains/stores/helpers";
import { AnalyticsPageClient } from "./analytics-client";

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

  return <AnalyticsPageClient slug={slug} storeName={store?.name} params={params} />;
}
