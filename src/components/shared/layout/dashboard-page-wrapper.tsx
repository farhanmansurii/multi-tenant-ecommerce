"use client";

import { ReactNode } from "react";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { PageContent } from "./page-content";
import { cn } from "@/lib/utils";

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
  const containerClassName = cn("space-y-6", className);

  return (
    <PageContainer
      maxWidth={maxWidth as "full" | "7xl" | "6xl" | "5xl" | "4xl" | "3xl" | "2xl"}
      className={containerClassName}
    >
      <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <PageHeader
          title={title}
          description={description}
          image={image}
          icon={icon}
          breadcrumbs={breadcrumbs}
          headerActions={headerActions}
          bottomActions={bottomActions}
        />
      </div>
      <PageContent contentKey={title} className="space-y-6">
        {children}
      </PageContent>
    </PageContainer>
  );
}
