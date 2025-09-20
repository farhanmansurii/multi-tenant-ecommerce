import StoreDashboard from "@/components/dashboard/stores/store-dashboard";

export default function StoreDashboardPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  return <StoreDashboard slug={slug} />;
}
