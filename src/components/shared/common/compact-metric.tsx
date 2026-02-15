"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type CompactColor = "blue" | "emerald" | "purple" | "amber" | "red" | "yellow" | "green" | "indigo";

const accentPalette: Record<CompactColor, string> = {
  blue: "border-border/60 bg-muted/40 text-muted-foreground",
  emerald: "border-border/60 bg-muted/40 text-muted-foreground",
  purple: "border-border/60 bg-muted/40 text-muted-foreground",
  amber: "border-border/60 bg-muted/40 text-muted-foreground",
  red: "border-border/60 bg-muted/40 text-muted-foreground",
  yellow: "border-border/60 bg-muted/40 text-muted-foreground",
  green: "border-border/60 bg-muted/40 text-muted-foreground",
  indigo: "border-border/60 bg-muted/40 text-muted-foreground",
};

export interface CompactMetricProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: CompactColor;
  className?: string;
  delay?: number;
}

export function CompactMetric({
  label,
  value,
  icon: Icon,
  color = "blue",
  className,
  delay = 0,
}: CompactMetricProps) {
  const accentClass = accentPalette[color];

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex w-full items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card px-4 py-3 text-left",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset] transition-all duration-300",
        "hover:border-border/80 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_12px_22px_rgba(0,0,0,0.10)]",
        className,
      )}
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: delay + 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl font-semibold leading-none tracking-tight text-foreground"
        >
          {value}
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm",
          accentClass,
        )}
      >
        <Icon className="h-4 w-4" />
      </motion.div>
    </motion.article>
  );
}
