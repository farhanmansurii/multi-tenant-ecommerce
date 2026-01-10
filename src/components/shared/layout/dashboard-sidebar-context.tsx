"use client";

import { createContext, useContext, ReactNode, useState } from "react";

interface DashboardSidebarContextValue {
  sidebar: ReactNode | null;
  setSidebar: (sidebar: ReactNode | null) => void;
}

const DashboardSidebarContext = createContext<DashboardSidebarContextValue | null>(null);

export function DashboardSidebarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebar, setSidebar] = useState<ReactNode | null>(null);

  return (
    <DashboardSidebarContext.Provider value={{ sidebar, setSidebar }}>
      {children}
    </DashboardSidebarContext.Provider>
  );
}

export function useDashboardSidebar() {
  return useContext(DashboardSidebarContext);
}

export function useSetDashboardSidebar() {
  const context = useDashboardSidebar();
  if (!context) {
    throw new Error("useSetDashboardSidebar must be used within DashboardSidebarProvider");
  }
  return context.setSidebar;
}
