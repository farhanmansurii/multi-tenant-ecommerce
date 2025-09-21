import type { Metadata } from "next";
import { generateBaseMetadata } from '@/lib/metadata';
import HomePageClient from './home-page-client';

export const metadata: Metadata = generateBaseMetadata({
  title: "Multi-Tenant Ecommerce Platform",
  description: "Create and manage your own online store with our powerful multi-tenant ecommerce platform. Start selling online today with our easy-to-use tools and features.",
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
  return <HomePageClient />;
}
