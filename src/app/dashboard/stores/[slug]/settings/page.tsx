import type { Metadata } from "next";
import { StoreSettings } from "@/components";
import { generateDashboardMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  return generateDashboardMetadata("settings", {
    title: `Store Settings - ${slug}`,
    description: `Configure your store "${slug}" settings including store information, branding, payment methods, shipping options, and more.`,
    keywords: ["store settings", "store configuration", "branding", "payment setup", "shipping", slug],
  });
}

export default function StoreSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  return <StoreSettings params={params} />;
}
