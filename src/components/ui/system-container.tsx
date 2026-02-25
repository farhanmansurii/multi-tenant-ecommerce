"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface SystemContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  badgeText?: string;
  delay?: number;
  disableAnimation?: boolean;
}

export function SystemContainer({
  badgeText = "RESTRICTED",
  delay = 0.8,
  disableAnimation = false,
  children,
  className,
  ...props
}: SystemContainerProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (disableAnimation) return;

      gsap.from(".system-reveal-text", {
        yPercent: 120,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "power4.out",
        delay: delay,
      });

      gsap.from(".system-reveal-box", {
        y: 40,
        autoAlpha: 0,
        duration: 0.8,
        ease: "expo.out",
        delay: delay + 0.2,
      });
    },
    { scope: container, dependencies: [disableAnimation, delay] },
  );

  return (
    <div ref={container} className="relative z-10 w-full max-w-lg px-6">
      <div
        {...props}
        className={cn(
          "system-reveal-box bg-[#111] border-[6px] border-[#111]",
          "shadow-[16px_16px_0_0_#FF3300] md:shadow-[24px_24px_0_0_#FF3300]",
          "p-8 md:p-12 flex flex-col relative w-full",
          disableAnimation ? "" : "invisible",
          className,
        )}
      >
        {badgeText && (
          <div className="absolute -top-4 -left-4 px-4 h-8 bg-[#FF3300] transform -rotate-2 z-20 flex items-center justify-center border-2 border-[#111]">
            <span className="font-space font-bold text-[#111] text-xs uppercase tracking-widest whitespace-nowrap">
              {badgeText}
            </span>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
