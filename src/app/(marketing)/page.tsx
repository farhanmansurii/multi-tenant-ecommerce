import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Kiosk - Multi-Tenant Commerce With Tenant Isolation Built In",
  description:
    "Build multi-tenant storefronts with draft-to-publish theming, a merchant dashboard, and Postgres RLS tenant isolation.",
});

import { HeroBrutalist } from "@/components/marketing/hero-brutalist";
import { FeaturesBrutalist } from "@/components/marketing/features-brutalist";
import { TerminalBrutalist } from "@/components/marketing/terminal-brutalist";
import { FooterBrutalist } from "@/components/marketing/footer-brutalist";

export default function Page() {
  return (
    <main className="w-full bg-[#EFEFEF]">
      <HeroBrutalist />
      <FeaturesBrutalist />
      <TerminalBrutalist />
      <FooterBrutalist />
    </main>
  );
}
