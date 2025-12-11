"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

export const MagneticButton = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const xTo = gsap.quickTo(btn, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(btn, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const mouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = btn.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * 0.2);
      yTo(y * 0.2);
      gsap.to(textRef.current, { x: x * 0.1, y: y * 0.1, duration: 0.5 });
    };

    const mouseLeave = () => {
      xTo(0); yTo(0);
      gsap.to(textRef.current, { x: 0, y: 0 });
    };

    btn.addEventListener("mousemove", mouseMove);
    btn.addEventListener("mouseleave", mouseLeave);
    return () => {
      btn.removeEventListener("mousemove", mouseMove);
      btn.removeEventListener("mouseleave", mouseLeave);
    };
  }, { scope: btnRef });

  return (
    <button ref={btnRef} className={cn("relative px-8 py-4 rounded-full border border-border hover:bg-foreground hover:text-background hover:border-transparent transition-colors duration-300 uppercase font-bold text-xs tracking-widest", className)}>
      <span ref={textRef} className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};
