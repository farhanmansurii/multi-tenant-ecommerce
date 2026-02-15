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
  md: "w-8 h-8 sm:w-10 sm:h-10",
  lg: "w-12 h-12 sm:w-14 sm:h-14",
  xl: "w-16 h-16 sm:w-20 sm:h-20",
};

const textSizeClasses = {
  xs: "text-xs",
  sm: "text-xs sm:text-sm",
  md: "text-sm sm:text-base",
  lg: "text-base sm:text-lg",
  xl: "text-lg sm:text-xl",
};

export const Loader = ({
  className,
  size = "md",
  variant = "default",
  text = "Loading...",
  ...props
}: LoaderProps) => {
  if (variant === "spinner") {
    return (
      <Loader2
        className={cn(
          "animate-spin text-muted-foreground transition-all duration-200",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm",
          "px-4 sm:px-6",
          className,
        )}
        {...props}
      >
        <Loader2
          className={cn("animate-spin text-primary transition-all duration-200", sizeClasses[size])}
        />
        {text && (
          <p
            className={cn(
              "mt-3 sm:mt-4 text-center text-muted-foreground max-w-xs sm:max-w-sm",
              textSizeClasses[size],
            )}
          >
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full min-h-[200px] sm:min-h-[300px] flex-col items-center justify-center gap-3 sm:gap-4",
        "px-4 sm:px-6",
        className,
      )}
      {...props}
    >
      <Loader2
        className={cn("animate-spin text-primary transition-all duration-200", sizeClasses[size])}
      />
      {text && (
        <p
          className={cn(
            "text-center text-muted-foreground max-w-xs sm:max-w-sm",
            textSizeClasses[size],
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
};
