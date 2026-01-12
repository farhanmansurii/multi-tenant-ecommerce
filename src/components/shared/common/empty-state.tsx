"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "search" | "success";
  className?: string;
}

const variantStyles = {
  default: {
    iconBg: "bg-gradient-to-br from-primary/10 to-primary/5",
    iconBorder: "border-primary/20",
    iconColor: "text-primary/60",
    containerBg: "bg-gradient-to-br from-card/50 to-card/30",
  },
  search: {
    iconBg: "bg-gradient-to-br from-muted/50 to-muted/30",
    iconBorder: "border-border/50",
    iconColor: "text-muted-foreground/60",
    containerBg: "bg-gradient-to-br from-card/50 to-card/30",
  },
  success: {
    iconBg: "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5",
    iconBorder: "border-emerald-500/20",
    iconColor: "text-emerald-500/60",
    containerBg: "bg-gradient-to-br from-emerald-500/5 to-emerald-500/2",
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  className,
}: EmptyStateProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col items-center justify-center py-24 px-4 border border-dashed border-border/50 rounded-xl backdrop-blur-sm",
        styles.containerBg,
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "h-20 w-20 rounded-2xl flex items-center justify-center mb-6 border",
          styles.iconBg,
          styles.iconBorder
        )}
      >
        <Icon className={cn("h-10 w-10", styles.iconColor)} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-xl font-semibold mb-2 text-foreground"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-muted-foreground text-sm max-w-md text-center mb-8"
      >
        {description}
      </motion.p>

      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          {action && (
            action.href ? (
              <Button size="lg" className="rounded-lg gap-2" asChild>
                <Link href={action.href}>
                  {action.icon && <action.icon className="h-4 w-4" />}
                  {action.label}
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="rounded-lg gap-2"
                onClick={action.onClick}
              >
                {action.icon && <action.icon className="h-4 w-4" />}
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            <Button
              size="lg"
              variant="outline"
              className="rounded-lg gap-2"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
