import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import DashboardLayout from "@/components/shared/layout/dashboard-container";
import StoreSettingsV2Shell from "@/components/features/dashboard/store-settings-v2-shell";
import { generateDashboardMetadata } from "@/lib/metadata";
import { getStoreBySlug } from "@/lib/domains/stores/helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return generateDashboardMetadata("settings", {
    title: `Configure Store - ${slug}`,
    description: `Configure operational settings for store "${slug}" using section-based updates.`,
    keywords: ["configure store", "store config", "checkout settings", "policies", slug],
  });
}

export default async function StoreConfigurePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  const settings = (store?.settings ?? {}) as {
    paymentMethods?: Array<"stripe" | "cod">;
    codEnabled?: boolean;
    shippingEnabled?: boolean;
    freeShippingThreshold?: number | null;
    termsOfService?: string;
    privacyPolicy?: string;
    refundPolicy?: string;
    storefrontContentMode?: "defaults" | "store" | "custom";
    storefrontContent?: Record<string, unknown>;
  };

  return (
    <DashboardLayout
      title="Configure"
      desc="Manage store configuration with section-based saves."
      icon={<SlidersHorizontal />}
      breadcrumbs={[
        { label: "Stores", href: "/dashboard/stores" },
        { label: store?.name || slug, href: `/dashboard/stores/${slug}` },
        { label: "Configure" },
      ]}
    >
      <StoreSettingsV2Shell
        slug={slug}
        storeName={store?.name || slug}
        initialSettings={{
          status: (store?.status as "draft" | "active" | "suspended") || "draft",
          storeName: store?.name || "",
          description: store?.description || "",
          email: store?.contactEmail || "",
          logo: store?.logo || "",
          primaryColor: store?.primaryColor || "#0F766E",
          currency: store?.currency || "USD",
          paymentMethods: settings.paymentMethods,
          codEnabled: settings.codEnabled,
          shippingEnabled: settings.shippingEnabled,
          freeShippingThreshold: settings.freeShippingThreshold,
          termsOfService: settings.termsOfService,
          privacyPolicy: settings.privacyPolicy,
          refundPolicy: settings.refundPolicy,
          storefrontContentMode: settings.storefrontContentMode,
          storefrontContent: settings.storefrontContent,
        }}
      />
    </DashboardLayout>
  );
}
