"use client";

import { ReactNode } from "react";
import { PageContainer } from "../page-container";
import { PageHeader } from "../page-header";
import { PageContent } from "../page-content";
import { PageSection } from "../page-section";
import { PageCard } from "../page-card";
import { cn } from "@/lib/utils";

type Breadcrumb = {
  label: string;
  href?: string;
  active?: boolean;
};

interface DetailLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  image?: string;
  breadcrumbs?: Breadcrumb[];
  headerActions?: ReactNode;
  metadata?: Array<{
    label: string;
    value: ReactNode;
  }>;
  sections?: Array<{
    title: string;
    description?: string;
    children: ReactNode;
    collapsible?: boolean;
  }>;
  children?: ReactNode;
  className?: string;
  maxWidth?: "full" | "7xl" | "6xl" | "4xl";
}

export function DetailLayout({
  title,
  description,
  icon,
  image,
  breadcrumbs,
  headerActions,
  metadata,
  sections,
  children,
  className,
  maxWidth = "full",
}: DetailLayoutProps) {
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
        {metadata && metadata.length > 0 && (
          <PageCard variant="outlined" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metadata.map((item, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-sm text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </PageCard>
        )}

        {sections && sections.length > 0 && (
          <div className="space-y-6">
            {sections.map((section, index) => (
              <PageSection
                key={index}
                title={section.title}
                description={section.description}
                collapsible={section.collapsible}
              >
                {section.children}
              </PageSection>
            ))}
          </div>
        )}

        {children && <div className="space-y-6">{children}</div>}
      </PageContent>
    </PageContainer>
  );
}
