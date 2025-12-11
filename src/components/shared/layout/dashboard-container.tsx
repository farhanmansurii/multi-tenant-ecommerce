'use client'

import React, { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Performance Fix 1
import { Image as ImageIcon, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardFooter } from './dashboard-footer';
import { DashboardNavbar } from './dashboard-navbar';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
  children: ReactNode;
  className?: string;
};

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
  children,
  className
}) => {
  return (
    <SidebarProvider>
      {sidebar}

      <SidebarInset className="bg-[#FDFDFD] dark:bg-[#0a0a0a] min-h-screen flex flex-col transition-colors duration-200">
        <DashboardNavbar />

        {/* Main Content Area */}
        <main className={cn("flex-1", fullWidth ? "w-full" : "max-w-7xl mx-auto w-full")}>
          <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10">

            {/* Header Section */}
            {(title || breadcrumbs) && (
              <header className="relative space-y-4 pb-6 border-b border-border/40">

                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav className="flex items-center text-sm text-muted-foreground mb-4">
                    {breadcrumbs.map((crumb, index) => (
                      <div key={index} className="flex items-center">
                        {index > 0 && (
                          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/40" />
                        )}
                        {crumb.href ? (
                          <Link
                            href={crumb.href}
                            className="hover:text-foreground transition-colors hover:underline underline-offset-4 decoration-border/50"
                          >
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className={cn(
                            "font-medium",
                            index === breadcrumbs.length - 1 ? "text-foreground" : ""
                          )}>
                            {crumb.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </nav>
                )}

                {/* Title & Actions Row */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

                  {/* Left: Icon/Image + Text */}
                  <div className="flex items-start gap-5">
                    {(image || icon) && (
                      <div className="relative shrink-0">
                        {/* Icon/Image Container */}
                        <div className="h-16 w-16 rounded-2xl border border-border bg-background shadow-sm flex items-center justify-center overflow-hidden">
                          {image ? (
                            <Image
                              src={image}
                              alt={title || "Page Icon"}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                              priority // Performance Fix 3: Loads immediately
                            />
                          ) : icon ? (
                            <div className="h-8 w-8 text-foreground/70 flex items-center justify-center [&>svg]:h-8 [&>svg]:w-8">
                              {icon}
                            </div>
                          ) : (
                            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      {title && (
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-left-2 duration-300">
                          {title}
                        </h1>
                      )}
                      {desc && (
                        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                          {desc}
                        </p>
                      )}

                      {bottomActions && (
                        <div className="pt-3 flex flex-wrap gap-2">
                          {bottomActions}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Primary Actions */}
                  {headerActions && (
                    <div className="flex items-center gap-3 shrink-0">
                      {headerActions}
                    </div>
                  )}
                </div>
              </header>
            )}

            {/* Content Body */}
            {/* Performance Fix 2: Reduced layout thrashing */}
            <motion.div
              key={title} // Unique key triggers animation on page change
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn("w-full relative", className)}
            >
              {!children && (
                <div className="absolute inset-0 -z-10 opacity-[0.03] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              )}
              {children}
            </motion.div>

          </div>
        </main>

        <div className="mt-auto border-t border-border/40">
          <DashboardFooter />
        </div>

      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
