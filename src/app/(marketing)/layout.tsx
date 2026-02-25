import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiosk - Multi-Tenant Commerce",
  description:
    "Multi-tenant commerce with tenant isolation, storefront theming, and a merchant dashboard.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
