import type { Metadata } from "next";
import { StoreCreate } from "@/components";
import { generateDashboardMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateDashboardMetadata("stores", {
  title: "Create New Store",
  description: "Create a new online store with our easy-to-use store builder. Set up your store information, branding, and start selling online in minutes.",
  keywords: ["create store", "new store", "store builder", "online store", "ecommerce setup"],
});

export default function StoreCreatePage() {
  return <StoreCreate />;
}
