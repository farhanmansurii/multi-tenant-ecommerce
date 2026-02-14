"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type CompactColor = "blue" | "emerald" | "purple" | "amber" | "red" | "yellow" | "green" | "indigo";

const accentPalette: Record<CompactColor, string> = {
  blue: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  purple: "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  amber: "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  red: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
  yellow: "border-yellow-500/25 bg-yellow-500/10 text-yellow-800 dark:text-yellow-300",
  green: "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300",
  indigo: "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
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
