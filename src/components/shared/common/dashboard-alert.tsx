"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface DashboardAlertProps {
  type: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  className?: string;
}

const alertConfig = {
  error: {
    icon: AlertCircle,
    variant: "destructive" as const,
    className: "border-red-500/50 bg-red-500/10",
    iconClassName: "text-red-600 dark:text-red-400",
    titleClassName: "text-red-800 dark:text-red-300",
    descriptionClassName: "text-red-700 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    variant: "default" as const,
    className: "border-amber-500/50 bg-amber-500/10",
    iconClassName: "text-amber-600 dark:text-amber-400",
    titleClassName: "text-amber-800 dark:text-amber-300",
    descriptionClassName: "text-amber-700 dark:text-amber-400",
  },
  info: {
    icon: Info,
    variant: "default" as const,
    className: "border-blue-500/50 bg-blue-500/10",
    iconClassName: "text-blue-600 dark:text-blue-400",
    titleClassName: "text-blue-800 dark:text-blue-300",
    descriptionClassName: "text-blue-700 dark:text-blue-400",
  },
  success: {
    icon: CheckCircle2,
    variant: "default" as const,
    className: "border-emerald-500/50 bg-emerald-500/10",
    iconClassName: "text-emerald-600 dark:text-emerald-400",
    titleClassName: "text-emerald-800 dark:text-emerald-300",
    descriptionClassName: "text-emerald-700 dark:text-emerald-400",
  },
};

export function DashboardAlert({
  type,
  title,
  message,
  action,
  dismissible = false,
  className,
}: DashboardAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const config = alertConfig[type];
  const Icon = config.icon;

  if (dismissed) return null;

  return (
    <Alert
      variant={config.variant}
      className={cn(
        "relative border",
        config.className,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconClassName)} />
        <div className="flex-1 min-w-0">
          <AlertTitle className={cn("mb-1", config.titleClassName)}>
            {title}
          </AlertTitle>
          <AlertDescription className={cn(config.descriptionClassName)}>
            {message}
          </AlertDescription>
          {action && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={action.onClick}
                className={cn("h-8", config.descriptionClassName, "border-current/20 hover:bg-current/10")}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 -mt-1 -mr-1 opacity-70 hover:opacity-100"
            onClick={() => setDismissed(true)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </Alert>
  );
}
