import { ReactNode } from "react";
import { StoreSidebarWrapper } from "./store-sidebar-wrapper";
import { getStoreBySlug } from "@/lib/domains/stores/helpers";
import { StoreDataProvider } from "./store-data-provider";

interface StoreLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { slug } = await params;
  // Prefetch store data in layout so all child pages can use it
  const store = await getStoreBySlug(slug);

  return (
    <StoreDataProvider initialStore={store}>
      <StoreSidebarWrapper slug={slug}>{children}</StoreSidebarWrapper>
    </StoreDataProvider>
  );
}
