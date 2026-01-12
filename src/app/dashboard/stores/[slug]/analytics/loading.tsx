import DashboardLayout from "@/components/shared/layout/dashboard-container";
import { BarChart3 } from "lucide-react";
import { AnalyticsSkeleton } from "@/components/features/dashboard/components/analytics-skeleton";

export default function Loading() {
  return (
    <DashboardLayout
      title="Analytics"
      desc="Track your store's performance and customer insights"
      icon={<BarChart3 />}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Stores" },
        { label: "Analytics" },
      ]}
      disableAnimation={true}
    >
      <AnalyticsSkeleton />
    </DashboardLayout>
  );
}
