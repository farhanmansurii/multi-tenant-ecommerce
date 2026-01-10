"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  headerActions?: ReactNode;
  /** Use overline style for title (11px, uppercase, tracked) */
  overlineTitle?: boolean;
}

export function PageSection({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className,
  headerActions,
  overlineTitle = false,
}: PageSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <section
      className={cn(
        "space-y-4",
        // Border between sections
        "pb-6 border-b border-border/40 last:border-b-0 last:pb-0",
        className
      )}
    >
      {(title || description || headerActions) && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            {title && (
              <div className="flex items-center gap-2">
                <h2
                  className={cn(
                    "font-semibold tracking-tight text-foreground",
                    overlineTitle
                      ? "text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
                      : "text-lg"
                  )}
                >
                  {title}
                </h2>
                {collapsible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted/50"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-expanded={!isCollapsed}
                    aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                  >
                    <motion.div
                      animate={{ rotate: isCollapsed ? -90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </Button>
                )}
              </div>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2 shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {(!collapsible || !isCollapsed) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
