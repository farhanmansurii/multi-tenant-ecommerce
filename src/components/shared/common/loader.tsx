import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { HTMLAttributes } from "react";

export type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "overlay" | "spinner";
  text?: string;
};

const sizeClasses = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export const Loader = ({
  className,
  size = "md",
  variant = "default",
  text = "Loading...",
  ...props
}: LoaderProps) => {
  if (variant === "spinner") {
    return <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)} />;
  }

  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        {text && <p className="mt-4 text-sm text-muted-foreground">{text}</p>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full min-h-[200px] flex-col items-center justify-center gap-4",
        className
      )}
      {...props}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};
