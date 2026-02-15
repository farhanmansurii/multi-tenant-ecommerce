"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MetricColor = "blue" | "emerald" | "purple" | "amber" | "red" | "yellow" | "green" | "indigo";

const accentPalette: Record<MetricColor, string> = {
  blue: "border-border/60 bg-muted/40 text-muted-foreground",
  emerald: "border-border/60 bg-muted/40 text-muted-foreground",
  purple: "border-border/60 bg-muted/40 text-muted-foreground",
  amber: "border-border/60 bg-muted/40 text-muted-foreground",
  red: "border-border/60 bg-muted/40 text-muted-foreground",
  yellow: "border-border/60 bg-muted/40 text-muted-foreground",
  green: "border-border/60 bg-muted/40 text-muted-foreground",
  indigo: "border-border/60 bg-muted/40 text-muted-foreground",
};

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: MetricColor;
  className?: string;
  delay?: number;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  color = "blue",
  className,
  delay = 0,
}: MetricCardProps) {
  const iconClass = accentPalette[color];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-border/50 bg-card p-5",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]",
        "transition-[border-color,box-shadow] duration-200",
        "hover:border-border/80 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_10px_20px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: delay + 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl font-semibold leading-none tracking-tight text-foreground"
          >
            {value}
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: delay, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm",
            iconClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </motion.div>
      </div>
    </motion.article>
  );
}
