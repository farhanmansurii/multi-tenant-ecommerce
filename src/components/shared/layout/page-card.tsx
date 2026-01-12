"use client";

import { ReactNode, forwardRef, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "default" | "outlined" | "elevated" | "ghost";
  className?: string;
  headerActions?: ReactNode;
  interactive?: boolean;
  noPadding?: boolean;
  animate?: boolean;
}

export const PageCard = forwardRef<HTMLDivElement, PageCardProps>(
  (
    {
      title,
      description,
      children,
      footer,
      variant = "default",
      className,
      headerActions,
      interactive = false,
      noPadding = false,
      animate = true,
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animate && cardRef.current) {
      gsap.set(cardRef.current, { opacity: 0, y: 8 });
      gsap.to(cardRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        delay: 0.05,
        ease: "power2.out",
      });
    } else if (cardRef.current) {
      gsap.set(cardRef.current, { opacity: 1, y: 0 });
    }
  }, [animate]);

    const variantClasses = {
      default: cn(
        "border-border bg-card",
        "shadow-sm",
        interactive && [
          "cursor-pointer",
          "transition-all duration-150",
          "hover:border-border-strong hover:shadow-md",
          "hover:-translate-y-0.5",
          "active:scale-[0.99]",
        ]
      ),
      outlined: cn(
        "border-border-strong bg-card",
        "shadow-xs",
        interactive && [
          "cursor-pointer",
          "transition-all duration-150",
          "hover:border-foreground/30 hover:shadow-sm",
          "hover:-translate-y-0.5",
          "active:scale-[0.99]",
        ]
      ),
      elevated: cn(
        "border-border bg-card",
        "shadow-md",
        interactive && [
          "cursor-pointer",
          "transition-all duration-150",
          "hover:shadow-lg hover:border-border-strong",
          "hover:-translate-y-1",
          "active:scale-[0.98]",
        ]
      ),
      ghost: cn(
        "border-transparent bg-transparent",
        "shadow-none",
        interactive && [
          "cursor-pointer",
          "transition-all duration-150",
          "hover:bg-muted/30 hover:border-border/50",
          "active:bg-muted/50",
        ]
      ),
    };

    return (
      <Card
        ref={(node) => {
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
          cardRef.current = node;
        }}
        className={cn(variantClasses[variant], className)}
      >
        {(title || description || headerActions) && (
          <CardHeader className={cn(noPadding && "px-0 pt-0")}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                {title && (
                  <CardTitle className="text-base font-semibold tracking-tight">
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className="text-sm">
                    {description}
                  </CardDescription>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center gap-2 shrink-0">
                  {headerActions}
                </div>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent className={cn(noPadding && "p-0")}>
          {children}
        </CardContent>
        {footer && (
          <CardFooter
            className={cn(
              "border-t border-border/40 pt-4",
              noPadding && "px-0 pb-0"
            )}
          >
            {footer}
          </CardFooter>
        )}
      </Card>
    );
  }
);

PageCard.displayName = "PageCard";
