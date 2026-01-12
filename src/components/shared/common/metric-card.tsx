"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "blue" | "emerald" | "purple" | "amber" | "red" | "yellow" | "green" | "indigo";
  className?: string;
  delay?: number;
}

const colorConfig = {
  blue: {
    color: "text-blue-500",
    glowBg: "bg-blue-500",
  },
  emerald: {
    color: "text-emerald-500",
    glowBg: "bg-emerald-500",
  },
  purple: {
    color: "text-purple-500",
    glowBg: "bg-purple-500",
  },
  amber: {
    color: "text-amber-500",
    glowBg: "bg-amber-500",
  },
  red: {
    color: "text-red-500",
    glowBg: "bg-red-500",
  },
  yellow: {
    color: "text-yellow-500",
    glowBg: "bg-yellow-500",
  },
  green: {
    color: "text-green-500",
    glowBg: "bg-green-500",
  },
  indigo: {
    color: "text-indigo-500",
    glowBg: "bg-indigo-500",
  },
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  color = "blue",
  className,
  delay = 0
}: MetricCardProps) {
  const config = colorConfig[color];

  return (
    <div
      className={cn(
        "group relative p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm",
        "hover:border-border/80 hover:bg-card/80",
        "transition-all duration-300 overflow-hidden",
        className
      )}
    >
      {/* Bottom glow bleeding */}
      <motion.div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-24 opacity-0",
          "group-hover:opacity-20 transition-all duration-500",
          config.glowBg
        )}
        style={{
          filter: "blur(40px)",
          transform: "translateY(50%)"
        }}
      />

      {/* Icon + Label */}
      <div className="flex items-center gap-2.5 mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative"
        >
          {/* Icon glow */}
          <div className="relative w-5 h-5">
            <motion.div
              className={cn(
                "absolute inset-0 scale-150 rounded-full opacity-0",
                "group-hover:opacity-25 transition-all duration-500",
                config.glowBg
              )}
              style={{
                filter: "blur(10px)",
                transform: "translateZ(0)"
              }}
            />
            <Icon
              className={cn("w-5 h-5 relative z-10", config.color)}
              strokeWidth={2}
            />
          </div>
        </motion.div>

        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-[13px] font-medium text-muted-foreground/80 tracking-wide"
        >
          {label}
        </motion.span>
      </div>

      {/* Value */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: delay + 0.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10"
      >
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
      </motion.div>
    </div>
  );
}
