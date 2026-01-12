"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Breadcrumb = {
  label: string;
  href?: string;
  active?: boolean;
};

interface PageHeaderProps {
  title?: string;
  description?: string;
  image?: string;
  icon?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  headerActions?: ReactNode;
  bottomActions?: ReactNode;
  sticky?: boolean;
  className?: string;
  /** Reduce title size for nested pages */
  compact?: boolean;
  /** Disable animations (useful for loading states) */
  disableAnimation?: boolean;
}

export function PageHeader({
  title,
  description,
  image,
  icon,
  breadcrumbs,
  headerActions,
  bottomActions,
  sticky = false,
  className,
  compact = false,
  disableAnimation = false,
}: PageHeaderProps) {
  if (!title && !breadcrumbs) {
    return null;
  }

  const headerContent = (
    <header
      className={cn(
        "relative pb-6",
        "border-b border-border/40",
        className
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 overflow-x-auto scrollbar-hide -mx-1 px-1"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isFirst = index === 0;
            const shouldTruncate = breadcrumbs.length > 4 && !isFirst && !isLast;

            return (
              <div key={index} className="flex items-center flex-shrink-0 gap-1.5">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className={cn(
                      "px-2 py-1 rounded-md transition-all duration-200",
                      "hover:text-foreground hover:bg-muted/50",
                      "active:bg-muted",
                      shouldTruncate
                        ? "max-w-[100px] sm:max-w-[150px] md:max-w-none truncate"
                        : "max-w-[150px] sm:max-w-[200px] md:max-w-none truncate"
                    )}
                    title={crumb.label}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "px-2 py-1 rounded-md",
                      isLast && "font-semibold text-foreground bg-muted/30",
                      shouldTruncate
                        ? "max-w-[100px] sm:max-w-[150px] md:max-w-none truncate"
                        : "max-w-[150px] sm:max-w-[200px] md:max-w-none truncate"
                    )}
                    title={crumb.label}
                  >
                    {crumb.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          {(image || icon) && (
            <div className="relative shrink-0">
              <div
                className={cn(
                  "flex items-center justify-center overflow-hidden",
                  "bg-card border border-border/50",
                  compact
                    ? "h-11 w-11 rounded-lg"
                    : "h-13 w-13 rounded-lg",
                  "shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]"
                )}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={title || "Page Icon"}
                    width={compact ? 48 : 56}
                    height={compact ? 48 : 56}
                    className="h-full w-full object-cover"
                    priority
                  />
                ) : icon ? (
                  <div
                    className={cn(
                      "text-foreground/70 flex items-center justify-center",
                      compact
                        ? "[&>svg]:h-5 [&>svg]:w-5"
                        : "[&>svg]:h-6 [&>svg]:w-6"
                    )}
                  >
                    {icon}
                  </div>
                ) : (
                  <ImageIcon
                    className={cn(
                      "text-muted-foreground/50",
                      compact ? "h-5 w-5" : "h-6 w-6"
                    )}
                  />
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5 min-w-0">
            {title && (
              <h1
                className={cn(
                  "font-semibold tracking-tight text-foreground text-balance",
                  compact
                    ? "text-xl md:text-2xl"
                    : "text-2xl md:text-3xl",
                  "leading-tight"
                )}
              >
                {title}
              </h1>
            )}
            {description && (
              <p
                className={cn(
                  "text-muted-foreground max-w-xl leading-relaxed",
                  compact ? "text-sm" : "text-base",
                  "opacity-90"
                )}
              >
                {description}
              </p>
            )}

            {bottomActions && (
              <div className="pt-3 flex flex-wrap items-center gap-2">
                {bottomActions}
              </div>
            )}
          </div>
        </div>

        {headerActions && (
          <div
            className="flex items-center gap-2 shrink-0 md:ml-4"
          >
            {headerActions}
          </div>
        )}
      </div>
    </header>
  );

  if (sticky) {
    return (
      <div
        className={cn(
          "sticky top-0 z-30",
          "bg-background/90 backdrop-blur-lg",
          "supports-[backdrop-filter]:bg-background/75",
          "-mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8",
          "border-b border-border/30"
        )}
      >
        {headerContent}
      </div>
    );
  }

  return headerContent;
}
