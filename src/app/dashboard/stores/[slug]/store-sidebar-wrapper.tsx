"use client";

import { ReactNode, useEffect } from "react";
import { StoreSidebar } from "@/components/features/dashboard/store-sidebar";
import { useSetDashboardSidebar } from "@/components/shared/layout/dashboard-sidebar-context";

interface StoreSidebarWrapperProps {
  slug: string;
  children: ReactNode;
}

export function StoreSidebarWrapper({ slug, children }: StoreSidebarWrapperProps) {
  const setSidebar = useSetDashboardSidebar();

  useEffect(() => {
    setSidebar(<StoreSidebar slug={slug} />);
    return () => {
      setSidebar(null);
    };
  }, [slug, setSidebar]);

  return <>{children}</>;
}
