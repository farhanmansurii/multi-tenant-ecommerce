import type { Metadata } from "next";
import { generateDashboardMetadata } from "@/lib/metadata";
import { redirect } from "next/navigation";


export const metadata: Metadata = generateDashboardMetadata("dashboard", {
  title: "Dashboard",
  description: "Manage your stores, products, and analytics from your dashboard. Get insights into your business performance and manage your online stores efficiently.",
  keywords: ["dashboard", "store management", "analytics", "business insights", "ecommerce management"],
});

export default function DashboardPage() {
  redirect("/dashboard/stores");
}
