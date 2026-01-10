"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MaxWidth } from "@/lib/design-tokens";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: MaxWidth;
  className?: string;
  fullWidth?: boolean;
  asymmetric?: boolean;
}

export function PageContainer({
  children,
  maxWidth = "full",
  className,
  fullWidth = false,
  asymmetric = false,
}: PageContainerProps) {
  const maxWidthClasses: Record<MaxWidth, string> = {
    full: "w-full",
    "7xl": "max-w-7xl mx-auto w-full",
    "6xl": "max-w-6xl mx-auto w-full",
    "5xl": "max-w-5xl mx-auto w-full",
    "4xl": "max-w-4xl mx-auto w-full",
    "3xl": "max-w-3xl mx-auto w-full",
    "2xl": "max-w-2xl mx-auto w-full",
    xl: "max-w-xl mx-auto w-full",
    lg: "max-w-lg mx-auto w-full",
    prose: "max-w-prose mx-auto w-full",
  };

  return (
    <div
      className={cn(
        "flex-1",
        fullWidth ? "w-full" : maxWidthClasses[maxWidth],
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-8",
          "p-4 md:p-6 lg:p-8",
          asymmetric && "lg:pl-12"
        )}
      >
        {children}
      </div>
    </div>
  );
}
