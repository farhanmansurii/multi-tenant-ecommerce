"use client";

import { ReactNode, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface PageContentProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  contentKey?: string;
  stagger?: boolean;
}

export function PageContent({
  children,
  className,
  animate = true,
  contentKey,
  stagger = false,
}: PageContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevContentKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!animate || !containerRef.current) {
      if (containerRef.current) {
        gsap.set(containerRef.current, { opacity: 1 });
      }
      return;
    }

    const isFirstRender = prevContentKeyRef.current === undefined;
    prevContentKeyRef.current = contentKey;

    if (isFirstRender) {
      gsap.set(containerRef.current, { opacity: 0 });
    }

    if (stagger) {
      const children = Array.from(containerRef.current.children);
      if (isFirstRender) {
        gsap.set(children, { opacity: 0, y: 12 });
      }
      gsap.to(children, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.06,
        delay: isFirstRender ? 0.1 : 0,
        ease: "power2.out",
      });
    } else {
      gsap.to(containerRef.current, {
        opacity: 1,
        duration: 0.25,
        delay: isFirstRender ? 0.05 : 0,
        ease: "power2.out",
      });
    }
  }, [animate, stagger, contentKey]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full relative", className)}
      style={{ willChange: "opacity" }}
    >
      {children}
    </div>
  );
}
