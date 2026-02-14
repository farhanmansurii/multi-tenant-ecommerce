"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MetricColor = "blue" | "emerald" | "purple" | "amber" | "red" | "yellow" | "green" | "indigo";

const accentPalette: Record<MetricColor, { icon: string; glow: string }> = {
  blue: {
    icon: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    glow: "from-blue-500/[0.10]",
  },
  emerald: {
    icon: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    glow: "from-emerald-500/[0.10]",
  },
  purple: {
    icon: "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300",
    glow: "from-purple-500/[0.10]",
  },
  amber: {
    icon: "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    glow: "from-amber-500/[0.12]",
  },
  red: {
    icon: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
    glow: "from-red-500/[0.10]",
  },
  yellow: {
    icon: "border-yellow-500/25 bg-yellow-500/10 text-yellow-800 dark:text-yellow-300",
    glow: "from-yellow-500/[0.12]",
  },
  green: {
    icon: "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300",
    glow: "from-green-500/[0.10]",
  },
  indigo: {
    icon: "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    glow: "from-indigo-500/[0.10]",
  },
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
  const accent = accentPalette[color];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border border-border/50 bg-card p-5",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]",
        "transition-[transform,border-color,background-color,box-shadow] duration-300",
        "hover:-translate-y-0.5 hover:border-border/80 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_18px_35px_rgba(0,0,0,0.10)]",
        "bg-gradient-to-br to-transparent",
        accent.glow,
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
            className="text-[clamp(1.6rem,3.2vw,2.2rem)] font-semibold leading-none tracking-tight text-foreground"
          >
            {value}
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: delay, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm",
            accent.icon,
          )}
        >
          <Icon className="h-5 w-5" />
        </motion.div>
      </div>
    </motion.article>
  );
}
