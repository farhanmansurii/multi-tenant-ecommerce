import type { Metadata } from "next";
import StoreDashboard from "@/components/features/dashboard/store-dashboard";
import { generateDashboardMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  return generateDashboardMetadata("stores", {
    title: `Store Dashboard - ${slug}`,
    description: `Manage your store "${slug}" - view products, analytics, and settings. Monitor your store performance and manage your product catalog.`,
    keywords: ["store dashboard", "store management", "products", "analytics", slug],
  });
}

export default function StoreDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  return <StoreDashboard params={params} />;
}
