import type { Metadata } from "next";
import { generateDashboardMetadata } from "@/lib/metadata";
import DashboardPageClient from "./dashboard-page-client";


export const metadata: Metadata = generateDashboardMetadata("dashboard", {
  title: "Dashboard",
  description: "Manage your stores, products, and analytics from your dashboard. Get insights into your business performance and manage your online stores efficiently.",
  keywords: ["dashboard", "store management", "analytics", "business insights", "ecommerce management"],
});

export default function DashboardPage() {
  return <DashboardPageClient />;
}
