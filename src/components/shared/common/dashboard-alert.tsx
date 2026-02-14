"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

const toneMap = {
  error: {
    icon: AlertCircle,
    accentLine: "bg-destructive/80",
  },
  warning: {
    icon: AlertTriangle,
    accentLine: "bg-warning/80",
  },
  info: {
    icon: Info,
    accentLine: "bg-accent/80",
  },
  success: {
    icon: CheckCircle2,
    accentLine: "bg-success/80",
  },
} as const;

export interface DashboardAlertProps {
  type: keyof typeof toneMap;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  className?: string;
}

export function DashboardAlert({
  type,
  title,
  message,
  action,
  dismissible = false,
  className,
}: DashboardAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const tone = toneMap[type];
  const Icon = tone.icon;

  if (dismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/40 bg-card/80 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-4 top-6 bottom-6 w-px rounded-full",
          tone.accentLine,
        )}
      />
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/40 bg-muted/40 text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1.5">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground/80">
            {type}
          </p>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
          {action && (
            <div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-border/40 bg-muted/30 px-3 text-sm font-semibold text-foreground transition hover:border-foreground/40 hover:text-foreground"
                onClick={action.onClick}
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
            className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </div>
  );
}
