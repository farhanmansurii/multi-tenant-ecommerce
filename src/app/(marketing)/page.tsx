import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";
import MarketingStorefrontLandingClient from "./storefront-landing-client";
import { Suspense } from "react";

export const metadata: Metadata = generateBaseMetadata({
  title: "Kiosk - Multi-Tenant Commerce With Tenant Isolation Built In",
  description:
    "Build multi-tenant storefronts with draft-to-publish theming, a merchant dashboard, and Postgres RLS tenant isolation.",
  keywords: [
    "ecommerce platform",
    "multi-tenant",
    "row level security",
    "storefront builder",
    "merchant dashboard",
    "discounts",
    "analytics",
    "checkout",
  ],
});

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MarketingStorefrontLandingClient />
    </Suspense>
  );
}
