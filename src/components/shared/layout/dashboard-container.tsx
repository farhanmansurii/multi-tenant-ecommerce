"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardFooter } from "./dashboard-footer";
import { DashboardNavbar } from "./dashboard-navbar";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { PageContent } from "./page-content";
import { MaxWidth } from "@/lib/design-tokens";

type Breadcrumb = {
  label: string;
  href?: string;
  active?: boolean;
};

type DashboardLayoutProps = {
  title?: string;
  desc?: string;
  image?: string;
  icon?: ReactNode;
  headerActions?: ReactNode;
  bottomActions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  sidebar?: ReactNode;
  fullWidth?: boolean;
  maxWidth?: MaxWidth;
  children: ReactNode;
  className?: string;
  /** Disable header animations (useful for loading states) */
  disableAnimation?: boolean;
};

function DashboardLayoutContent({
  title,
  desc,
  image,
  icon,
  headerActions,
  bottomActions,
  breadcrumbs,
  fullWidth = true,
  maxWidth = "full",
  children,
  className,
  disableAnimation = false,
}: Omit<DashboardLayoutProps, "sidebar">) {
  const pathname = usePathname();
  const contentKey = pathname || title || "page";

  return (
    <PageContainer maxWidth={fullWidth ? "full" : maxWidth} className={className}>
      <PageHeader
        title={title}
        description={desc}
        image={image}
        icon={icon}
        breadcrumbs={breadcrumbs}
        headerActions={headerActions}
        bottomActions={bottomActions}
        disableAnimation={disableAnimation}
      />
      <PageContent contentKey={contentKey} animate={!disableAnimation}>{children}</PageContent>
    </PageContainer>
  );
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  desc,
  image,
  icon,
  headerActions,
  bottomActions,
  breadcrumbs,
  sidebar,
  fullWidth = true,
  maxWidth = "full",
  children,
  className,
  disableAnimation = false,
}) => {
  let isInsideLayout = false;
  try {
    useSidebar();
    isInsideLayout = true;
  } catch {
    isInsideLayout = false;
  }

  if (isInsideLayout) {
    return (
      <DashboardLayoutContent
        title={title}
        desc={desc}
        image={image}
        icon={icon}
        headerActions={headerActions}
        bottomActions={bottomActions}
        breadcrumbs={breadcrumbs}
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        className={className}
        disableAnimation={disableAnimation}
      >
        {children}
      </DashboardLayoutContent>
    );
  }

  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset className="bg-background min-h-screen flex flex-col transition-colors duration-200">
        <DashboardNavbar />

        <main className="flex-1">
          <DashboardLayoutContent
            title={title}
            desc={desc}
            image={image}
            icon={icon}
            headerActions={headerActions}
            bottomActions={bottomActions}
            breadcrumbs={breadcrumbs}
            fullWidth={fullWidth}
            maxWidth={maxWidth}
            className={className}
            disableAnimation={disableAnimation}
          >
            {children}
          </DashboardLayoutContent>
        </main>

        <div className="mt-auto border-t border-border/40">
          <DashboardFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
