"use client";

import { ReactNode } from "react";
import { Loader } from "@/components/shared/common/loader";
import { useRequireAuth } from "@/lib/session";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/components/shared/layout/dashboard-navbar";
import { DashboardFooter } from "@/components/shared/layout/dashboard-footer";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { DashboardSidebarProvider, useDashboardSidebar } from "@/components/shared/layout/dashboard-sidebar-context";

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { sidebar } = useDashboardSidebar() || { sidebar: null };
  const activeSidebar = sidebar || <AppSidebar className="" />;

  return (
    <SidebarProvider>
      {activeSidebar}
      <SidebarInset className="bg-background min-h-screen flex flex-col transition-colors duration-200">
        <DashboardNavbar />
        <main className="flex-1">{children}</main>
        <div className="mt-auto border-t border-border/40">
          <DashboardFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isPending } = useRequireAuth();

  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      redirect("/");
    }
  }, [isAuthenticated, isPending]);

  if (isPending) {
    return <Loader text="Loading Dashboard" className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardSidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardSidebarProvider>
  );
}
