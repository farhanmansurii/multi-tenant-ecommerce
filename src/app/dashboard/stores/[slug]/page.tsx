import StoreDashboard from "@/components/features/dashboard/store-dashboard";

export default function StoreDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  return <StoreDashboard params={params} />;
}
