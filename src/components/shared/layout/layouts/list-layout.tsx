"use client";

import { ReactNode } from "react";
import { PageContainer } from "../page-container";
import { PageHeader } from "../page-header";
import { PageContent } from "../page-content";
import { PageSection } from "../page-section";
import { cn } from "@/lib/utils";

type Breadcrumb = {
  label: string;
  href?: string;
  active?: boolean;
};

interface ListLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  image?: string;
  breadcrumbs?: Breadcrumb[];
  headerActions?: ReactNode;
  searchBar?: ReactNode;
  filterBar?: ReactNode;
  children: ReactNode;
  className?: string;
  maxWidth?: "full" | "7xl" | "6xl" | "4xl";
}

export function ListLayout({
  title,
  description,
  icon,
  image,
  breadcrumbs,
  headerActions,
  searchBar,
  filterBar,
  children,
  className,
  maxWidth = "full",
}: ListLayoutProps) {
  return (
    <PageContainer maxWidth={maxWidth} className={className}>
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        image={image}
        breadcrumbs={breadcrumbs}
        headerActions={headerActions}
      />

      <PageContent>
        {(searchBar || filterBar) && (
          <PageSection className="pb-4 border-b-0">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              {searchBar && <div className="flex-1">{searchBar}</div>}
              {filterBar && <div className="flex items-center gap-2">{filterBar}</div>}
            </div>
          </PageSection>
        )}

        <div className="space-y-6">{children}</div>
      </PageContent>
    </PageContainer>
  );
}
