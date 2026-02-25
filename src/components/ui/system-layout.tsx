"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { PageTransition } from "./page-transition";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface SystemLayoutProps {
  children: React.ReactNode;
  bgWord1?: string;
  bgWord2?: string;
  disableTransition?: boolean;
}

export function SystemLayout({
  children,
  bgWord1 = "AUTH",
  bgWord2 = "GATE",
  disableTransition = false,
}: SystemLayoutProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".system-bg-text", {
        yPercent: 120,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "power4.out",
        delay: disableTransition ? 0.2 : 0.8,
      });
    },
    { scope: container, dependencies: [disableTransition] },
  );

  return (
    <div
      ref={container}
      className="relative min-h-screen flex items-center justify-center bg-[#EFEFEF] overflow-hidden"
    >
      <style>{`
        .font-bricolage { font-family: 'Bricolage Grotesque', sans-serif; }
        .font-space { font-family: 'Space Mono', monospace; }
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image:
          linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        }
      `}</style>

      {!disableTransition && <PageTransition />}

      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.03] overflow-hidden bg-grid-pattern">
        <div className="overflow-hidden">
          <h2 className="system-bg-text font-bricolage text-[30vw] font-black uppercase leading-[0.8] whitespace-nowrap -ml-24">
            {bgWord1}
          </h2>
        </div>
        <div className="overflow-hidden">
          <h2 className="system-bg-text font-bricolage text-[30vw] font-black uppercase leading-[0.8] whitespace-nowrap ml-32">
            {bgWord2}
          </h2>
        </div>
      </div>

      {children}
    </div>
  );
}
