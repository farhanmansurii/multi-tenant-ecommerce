import type { Metadata } from "next";
import StoreDashboard from "@/components/features/dashboard/store-dashboard";
import { generateDashboardMetadata } from "@/lib/metadata";
import { getStoreBySlug } from "@/lib/domains/stores/helpers";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  return generateDashboardMetadata("stores", {
    title: `Store Dashboard - ${slug}`,
    description: `Manage your store "${slug}" - view products, analytics, and settings. Monitor your store performance and manage your product catalog.`,
    keywords: ["store dashboard", "store management", "products", "analytics", slug],
  });
}

export default async function StoreDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  return <StoreDashboard params={params} initialStore={store} />;
}
