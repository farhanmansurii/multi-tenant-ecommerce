"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

function Tabs({
  className,
  value,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [prevValue, setPrevValue] = useState<string | undefined>(value)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      setPrevValue(value)
      if (containerRef.current) {
        const activeContent = containerRef.current.querySelector(
          `[data-tab-content="${value}"]`
        ) as HTMLElement
        if (activeContent) {
          gsap.set(activeContent, { opacity: 1, x: 0 })
        }
      }
      return
    }

    if (prevValue && value && prevValue !== value && containerRef.current) {
      const oldContent = containerRef.current.querySelector(
        `[data-tab-content="${prevValue}"]`
      ) as HTMLElement
      const newContent = containerRef.current.querySelector(
        `[data-tab-content="${value}"]`
      ) as HTMLElement

      if (oldContent && newContent) {
        const tl = gsap.timeline()

        tl.to(oldContent, {
          opacity: 0,
          x: -8,
          duration: 0.2,
          ease: "power2.inOut",
        })
        .set(oldContent, { visibility: "hidden" })
        .set(newContent, {
          visibility: "visible",
          opacity: 0,
          x: 8,
          display: "block"
        })
        .to(newContent, {
          opacity: 1,
          x: 0,
          duration: 0.25,
          ease: "power2.out",
        }, "-=0.1")
      }
    }
    setPrevValue(value)
  }, [value, prevValue])

  return (
    <TabsPrimitive.Root
      ref={containerRef}
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      value={value}
      onValueChange={onValueChange}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & { value: string }) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      const observer = new MutationObserver(() => {
        if (contentRef.current) {
          const isHidden = contentRef.current.getAttribute('data-state') === 'inactive'
          if (isHidden) {
            gsap.set(contentRef.current, { opacity: 0, visibility: "hidden", x: 8 })
          } else {
            gsap.set(contentRef.current, { visibility: "visible" })
          }
        }
      })

      if (contentRef.current) {
        observer.observe(contentRef.current, {
          attributes: true,
          attributeFilter: ['data-state'],
        })
      }

      const initialState = contentRef.current.getAttribute('data-state')
      if (initialState === 'inactive') {
        gsap.set(contentRef.current, { opacity: 0, visibility: "hidden", x: 8 })
      } else {
        gsap.set(contentRef.current, { opacity: 1, visibility: "visible", x: 0 })
      }

      return () => observer.disconnect()
    }
  }, [])

  return (
    <TabsPrimitive.Content
      ref={contentRef}
      data-tab-content={value}
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      style={{ willChange: "opacity, transform" }}
      value={value}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
