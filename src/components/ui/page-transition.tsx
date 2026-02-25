"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface PageTransitionProps {
  onComplete?: () => void;
}

export function PageTransition({ onComplete }: PageTransitionProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      document.body.style.overflow = "hidden";

      const tl = gsap.timeline();

      tl.to(".preloader-panel-black", {
        height: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.inOut",
        delay: 0.1,
      })
        .to(
          ".preloader-panel-orange",
          {
            height: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power4.inOut",
          },
          "-=0.2",
        )
        .to(
          ".preloader",
          {
            autoAlpha: 0,
            duration: 0.1,
            onComplete: () => {
              document.body.style.overflow = "";
              if (onComplete) onComplete();
            },
          },
          "-=0.2",
        );
    },
    { scope: container },
  );

  return (
    <div ref={container} className="preloader fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 flex">
        <div className="preloader-panel-orange w-1/4 h-full bg-[#FF3300]" />
        <div className="preloader-panel-orange w-1/4 h-full bg-[#FF3300]" />
        <div className="preloader-panel-orange w-1/4 h-full bg-[#FF3300]" />
        <div className="preloader-panel-orange w-1/4 h-full bg-[#FF3300]" />
      </div>
      <div className="absolute inset-0 flex">
        <div className="preloader-panel-black w-1/4 h-full bg-[#111] border-r border-[#333]" />
        <div className="preloader-panel-black w-1/4 h-full bg-[#111] border-r border-[#333]" />
        <div className="preloader-panel-black w-1/4 h-full bg-[#111] border-r border-[#333]" />
        <div className="preloader-panel-black w-1/4 h-full bg-[#111]" />
      </div>
    </div>
  );
}
