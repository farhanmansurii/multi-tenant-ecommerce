import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { HTMLAttributes } from "react";

export type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "overlay" | "spinner" | "shimmer";
  text?: string;
};

const sizeClasses = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export const Loader = ({
  className,
  size = "md",
  variant = "default",
  text = "Loading...",
  ...props
}: LoaderProps) => {

  // --- 1. The "Wow" Spinner (SVG based for smoothness) ---
  const OrbitalSpinner = () => (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>

      {/* Layer 1: Ambient Glow (Behind) - Adds the "Premium" feel */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />

      {/* Layer 2: Outer Track (Static) */}
      <svg className="absolute inset-0 h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
      </svg>

      {/* Layer 3: Active Gradient Ring (Spinning) */}
      <svg className="absolute inset-0 h-full w-full animate-spin duration-1000" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.5" />
            <stop offset="100%" stopColor="currentColor" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="200"
          strokeDashoffset="100"
          className="text-primary"
        />
      </svg>

      {/* Layer 4: Inner Floating Dot (Pulsing) */}
      <div className="absolute h-[25%] w-[25%] rounded-full bg-primary shadow-[0_0_10px_currentColor] animate-ping opacity-20" />
      <div className="absolute h-[20%] w-[20%] rounded-full bg-background border-2 border-primary" />
    </div>
  );

  // --- Variant 1: Tiny Spinner (For Buttons) ---
  if (variant === "spinner") {
    return <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)} />;
  }

  // --- Variant 2: Full Screen / Container Overlay ---
  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[4px] transition-all duration-300",
          className
        )}
        {...props}
      >
        <div className="relative flex flex-col items-center gap-4 p-6 rounded-3xl bg-background/80 shadow-2xl border border-white/10 ring-1 ring-black/5">
          <OrbitalSpinner />
          {text && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-semibold tracking-wide text-foreground animate-pulse">
                {text}
              </p>
              {/* Simulated Progress Bar */}
              <div className="h-1 w-20 bg-muted overflow-hidden rounded-full">
                <div className="h-full w-full bg-primary origin-left animate-[scale-x_1s_ease-in-out_infinite]" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Variant 3: Default (Center of page/div) ---
  return (
    <div
      className={cn(
        "flex w-full min-h-[200px] flex-col items-center justify-center gap-6",
        className
      )}
      {...props}
    >
      <OrbitalSpinner />

      {text && (
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-medium tracking-tight text-foreground">
            {text}
          </h3>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest opacity-70">
            Please wait...
          </p>
        </div>
      )}
    </div>
  );
};
