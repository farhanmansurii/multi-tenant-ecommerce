import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/90 text-primary-foreground [a&]:hover:bg-primary",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive/90 text-destructive-foreground [a&]:hover:bg-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        success:
          "border-success/30 bg-success/15 text-success-foreground [a&]:hover:bg-success/20",
        warning:
          "border-warning/30 bg-warning/20 text-warning-foreground [a&]:hover:bg-warning/25",
        info:
          "border-info/30 bg-info/15 text-info-foreground [a&]:hover:bg-info/20",
        outline:
          "text-foreground border-border/60 [a&]:hover:bg-muted/50 [a&]:hover:border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
