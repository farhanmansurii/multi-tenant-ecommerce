"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (container.current) {
          container.current.style.display = "none";
        }
        onComplete();
      }
    });

    tl.to(".counter", { opacity: 0, duration: 0.5, delay: 1 })
      .to(container.current, { yPercent: -100, duration: 1.2, ease: "power4.inOut" })
      .from(".hero-title-char", {
        y: "100%",
        rotate: 5,
        duration: 1.5,
        stagger: 0.05,
        ease: "power4.out"
      }, "-=0.5")
      .from(".hero-sub", { opacity: 0, y: 20, duration: 1 }, "-=1");
  }, { scope: container });

  return (
    <div ref={container} className="overlay fixed inset-0 z-[100] bg-primary flex items-end justify-between p-10 overflow-hidden">
      <div className="counter font-grotesk text-9xl font-bold text-primary-foreground leading-none">
        100%
      </div>
      <div className="counter font-mono text-xs text-primary-foreground uppercase tracking-widest animate-pulse">
        Initializing Environment...
      </div>
    </div>
  );
};
