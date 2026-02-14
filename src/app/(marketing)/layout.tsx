import React from "react";
import type { Metadata } from "next";
import "./marketing-storefront.scoped.css";
import "./marketing-extra.css";
import { Koulen, DM_Mono, Host_Grotesk } from "next/font/google";

export const metadata: Metadata = {
  title: "Kiosk - Multi-Tenant Commerce",
  description:
    "Multi-tenant commerce with tenant isolation, storefront theming, and a merchant dashboard.",
};

const koulen = Koulen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-koulen",
});

const hostGrotesk = Host_Grotesk({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-host-grotesk",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={[
        "overflow-hidden",
        "storefront-ui",
        koulen.variable,
        hostGrotesk.variable,
        dmMono.variable,
      ].join(" ")}
    >
      <div className="storefront-scope">{children}</div>
    </div>
  );
}
