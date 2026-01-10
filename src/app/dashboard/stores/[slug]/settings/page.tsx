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

import { Settings } from 'lucide-react';
import DashboardLayout from '@/components/shared/layout/dashboard-container';
import { getStoreBySlug } from '@/lib/domains/stores/helpers';

export default async function StoreSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  return (
    <DashboardLayout
      title="Settings"
      desc="Configure your store settings"
      icon={<Settings />}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Stores', href: '/dashboard/stores' },
        { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: 'Settings' },
      ]}
    >
      <StoreSettings params={params} />
    </DashboardLayout>
  );
}
