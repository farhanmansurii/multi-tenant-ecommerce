import type { Metadata } from "next";
import { generateBaseMetadata } from '@/lib/metadata';
import LandingPage from "./home-page-client";


export const metadata: Metadata = generateBaseMetadata({
  title: "Kiosk - Your Personal Storefront Builder",
  description: "Create and manage your own online store with Kiosk. Simple, powerful, and yours.",
  keywords: [
    "ecommerce platform",
    "online store builder",
    "multi-tenant",
    "shopping cart",
    "online selling",
    "store management",
    "digital commerce",
    "retail platform"
  ],
});

export default function Home() {
  return (<LandingPage />)
}
