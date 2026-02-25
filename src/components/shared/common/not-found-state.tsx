"use client";

import Link from "next/link";
import { FileX, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface NotFoundStateProps {
  title?: string;
  message?: string;
  backHref?: string;
  backLabel?: string;
  icon?: LucideIcon;
  className?: string;
}

export function NotFoundState({
  title = "Not Found",
  message = "The requested resource could not be found.",
  backHref = "/dashboard",
  backLabel = "Back to Dashboard",
  icon: Icon = FileX,
  className,
}: NotFoundStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col items-center justify-center py-24 px-4 min-h-[60vh]",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 bg-destructive/10 rounded-full blur-2xl" />
        <div className="relative h-24 w-24 rounded-3xl bg-background border border-border/50 shadow-xl shadow-destructive/10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-destructive/15 to-warning/10 opacity-60" />
          <Icon className="h-10 w-10 text-destructive/80" />
          <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive border-2 border-background animate-pulse" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-2 text-center mb-8 max-w-md"
      >
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="text-muted-foreground text-balance leading-relaxed">
          {message}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button variant="outline" className="rounded-lg h-11 px-6" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
        <Button className="rounded-lg h-11 px-6" asChild>
          <Link href="/dashboard/stores">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            View Stores
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
