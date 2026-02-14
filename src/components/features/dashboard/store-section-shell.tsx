"use client";

import * as React from "react";

import DashboardLayout from "@/components/shared/layout/dashboard-container";

type Props = {
  slug: string;
  storeName?: string;
  title: string;
  desc?: string;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
};

export function StoreSectionShell({
  slug,
  storeName,
  title,
  desc,
  icon,
  headerActions,
  children,
}: Props) {
  const storeLabel = storeName || slug;

  return (
    <DashboardLayout
      title={title}
      desc={desc}
      icon={icon}
      breadcrumbs={[
        { label: "Stores", href: "/dashboard/stores" },
        { label: storeLabel, href: `/dashboard/stores/${slug}` },
        { label: title },
      ]}
      headerActions={headerActions}
    >
      {children}
    </DashboardLayout>
  );
}
