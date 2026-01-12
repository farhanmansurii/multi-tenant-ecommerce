"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function RefreshButton({
  onRefresh,
  isRefreshing = false,
  variant = "outline",
  size = "sm",
  className,
}: RefreshButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onRefresh}
      disabled={isRefreshing}
      className={cn(className)}
    >
      <RefreshCw className={cn("h-4 w-4", size === "sm" && "mr-2", isRefreshing && "animate-spin")} />
      {size !== "icon" && (isRefreshing ? "Refreshing..." : "Refresh")}
    </Button>
  );
}
