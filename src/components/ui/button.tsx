"use client";
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	cn(
		"inline-flex items-center justify-center gap-2 whitespace-nowrap",
		"rounded-md text-sm font-medium",
		"transition-all duration-200 ease-out",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
		"disabled:pointer-events-none disabled:opacity-40",
		"active:scale-[0.98]",
		"[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
		"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	),
	{
		variants: {
			variant: {
				default: cn(
					"bg-primary text-primary-foreground",
					"hover:bg-primary/90",
					"shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]"
				),
				destructive: cn(
					"bg-destructive text-destructive-foreground",
					"hover:bg-destructive/90",
					"shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]",
					"focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
				),
				outline: cn(
					"border border-border/60 bg-background",
					"hover:bg-muted/50 hover:border-border",
					"dark:bg-card/50 dark:border-border/50 dark:hover:bg-card dark:hover:border-border/70"
				),
				secondary: cn(
					"bg-secondary text-secondary-foreground",
					"hover:bg-secondary/80"
				),
				ghost: cn(
					"hover:bg-muted/50 hover:text-foreground",
					"dark:hover:bg-muted/30"
				),
				link: cn(
					"text-foreground underline-offset-4",
					"hover:underline hover:text-foreground/80"
				),
				accent: cn(
					"bg-accent-primary text-accent-primary-foreground",
					"hover:bg-accent-primary/90",
					"shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]"
				),
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md px-3 text-xs has-[>svg]:px-2.5 gap-1.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				xl: "h-11 rounded-lg px-8 text-base",
				icon: "h-9 w-9",
				"icon-sm": "h-8 w-8",
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
