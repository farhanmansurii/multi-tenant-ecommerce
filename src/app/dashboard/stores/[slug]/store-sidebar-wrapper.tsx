"use client";

import { ReactNode, useEffect } from "react";
import { StoreSidebar } from "@/components/features/dashboard/store-sidebar";
import { useSetDashboardSidebar } from "@/components/shared/layout/dashboard-sidebar-context";
import { useStore } from "@/hooks/queries/use-store";

interface StoreSidebarWrapperProps {
  slug: string;
  children: ReactNode;
}

export function StoreSidebarWrapper({ slug, children }: StoreSidebarWrapperProps) {
  const setSidebar = useSetDashboardSidebar();
  const { data: store } = useStore(slug);

  useEffect(() => {
    setSidebar(
      <StoreSidebar
        slug={slug}
        storeName={store?.name}
        storeLogo={store?.logo}
      />
    );
    return () => {
      setSidebar(null);
    };
  }, [slug, store?.name, store?.logo, setSidebar]);

  return <>{children}</>;
}
