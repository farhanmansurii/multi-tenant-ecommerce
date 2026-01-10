"use client";

import { ReactNode } from "react";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { PageContent } from "./page-content";

type Breadcrumb = {
  label: string;
  href?: string;
  active?: boolean;
};

interface DashboardPageWrapperProps {
  title?: string;
  description?: string;
  image?: string;
  icon?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  headerActions?: ReactNode;
  bottomActions?: ReactNode;
  children: ReactNode;
  maxWidth?: "full" | "7xl" | "6xl" | "5xl" | "4xl" | "3xl" | "2xl";
  className?: string;
}

export function DashboardPageWrapper({
  title,
  description,
  image,
  icon,
  breadcrumbs,
  headerActions,
  bottomActions,
  children,
  maxWidth = "full",
  className,
}: DashboardPageWrapperProps) {
  return (
    <PageContainer maxWidth={maxWidth as "full" | "7xl" | "6xl" | "5xl" | "4xl" | "3xl" | "2xl"} className={className}>
      <PageHeader
        title={title}
        description={description}
        image={image}
        icon={icon}
        breadcrumbs={breadcrumbs}
        headerActions={headerActions}
        bottomActions={bottomActions}
      />
      <PageContent contentKey={title}>{children}</PageContent>
    </PageContainer>
  );
}
