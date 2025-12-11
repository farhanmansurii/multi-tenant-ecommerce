"use client";

import React, { useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Globe,
  MousePointer2,
  Zap
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

const FloatingWidget = ({
  children,
  className,
  speed = 1
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) => {
  return (
    <div
      data-speed={speed}
      className={cn(
        "floating-widget absolute hidden md:flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-[#111]/80 backdrop-blur-md shadow-2xl select-none",
        className
      )}
    >
      {children}
    </div>
  );
};

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // --- MOUSE PARALLAX EFFECT ---
  useGSAP(() => {
    if (!container.current) return;

    // 1. Entrance Animation (Timeline)
    const tl = gsap.timeline();

    tl.fromTo(".hero-grid",
      { opacity: 0, scale: 1.2 },
      { opacity: 1, scale: 1, duration: 2, ease: "power2.out" }
    )
      .fromTo(".hero-word",
        { y: 100, opacity: 0, rotate: 5 },
        { y: 0, opacity: 1, rotate: 0, duration: 1, stagger: 0.1, ease: "back.out(1.7)" },
        "-=1.5"
      )
      .fromTo(".floating-widget",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, stagger: 0.1, ease: "elastic.out(1, 0.75)" },
        "-=0.5"
      )
      .fromTo(".hero-cta",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.5"
      );

    // 2. Mouse Parallax (Desktop Only)
    // We use GSAP QuickTo for high-performance mouse tracking
    const widgets = gsap.utils.toArray<HTMLElement>(".floating-widget");
    const xSetters = widgets.map(w => gsap.quickTo(w, "x", { duration: 1, ease: "power3" }));
    const ySetters = widgets.map(w => gsap.quickTo(w, "y", { duration: 1, ease: "power3" }));

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 100; // Range -50 to 50
      const y = (e.clientY / window.innerHeight - 0.5) * 100;

      widgets.forEach((w, i) => {
        const speed = Number(w.dataset.speed) || 1;
        xSetters[i](x * speed);
        ySetters[i](y * speed);
      });
    };

    // Only add listener on desktop media query to save mobile resources
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    });

  }, { scope: container });

  return (
    <section
      ref={container}
      className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#050505] text-[#e1e1e1] pt-20"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* 1. BACKGROUND GRID (Animated) */}
      <div className="hero-grid absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"
        />
        {/* Spotlight Effect */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(197,247,79,0.15),transparent_70%)]" />
      </div>

      {/* 2. FLOATING WIDGETS (The "Gumroad" Elements) */}
      {/* Top Left: Revenue */}
      <FloatingWidget className="top-[15%] left-[10%] border-[#C5F74F]/20" speed={1.5}>
        <div className="w-10 h-10 rounded-full bg-[#C5F74F]/20 flex items-center justify-center text-[#C5F74F]">
          <BarChart3 size={20} />
        </div>
        <div>
          <div className="text-xs text-white/50 font-mono uppercase">Revenue</div>
          <div className="text-lg font-bold font-mono">$842.2k</div>
        </div>
      </FloatingWidget>

      {/* Top Right: Global */}
      <FloatingWidget className="top-[20%] right-[10%]" speed={-1}>
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
          <Globe size={20} />
        </div>
        <div>
          <div className="text-xs text-white/50 font-mono uppercase">Active Regions</div>
          <div className="text-lg font-bold font-mono">142</div>
        </div>
      </FloatingWidget>

      {/* Bottom Left: Payment */}
      <FloatingWidget className="bottom-[20%] left-[15%]" speed={-1.2}>
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
          <CreditCard size={20} />
        </div>
        <div className="flex gap-2 text-sm font-mono">
          <span>Payment</span>
          <span className="text-[#C5F74F]">Verified</span>
        </div>
      </FloatingWidget>

      {/* Bottom Right: Speed */}
      <FloatingWidget className="bottom-[25%] right-[15%] border-red-500/20" speed={2}>
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
          <Zap size={20} />
        </div>
        <div>
          <div className="text-xs text-white/50 font-mono uppercase">Latency</div>
          <div className="text-lg font-bold font-mono">24ms</div>
        </div>
      </FloatingWidget>


      {/* 3. MAIN CONTENT */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">

        {/* Pill Label */}
        <div className="hero-cta inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C5F74F]/30 bg-[#C5F74F]/5 text-[#C5F74F] font-mono text-xs tracking-widest uppercase mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5F74F] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5F74F]"></span>
          </span>
          Kiosk v2.0 Live
        </div>

        {/* Headline: Responsive text sizing */}
        <h1 className="flex flex-col items-center text-[13vw] md:text-[8rem] leading-[0.85] font-bold tracking-tighter text-white mix-blend-screen">
          <span className="hero-word overflow-hidden inline-block origin-bottom-left">COMMERCE</span>
          <span className="hero-word overflow-hidden inline-flex items-center gap-2 md:gap-6 origin-bottom-right text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
            FROM A
            {/* Decorative Icon inside Text */}
            <span className="hidden md:flex h-16 w-32 rounded-full border border-white/20 bg-white/5 items-center justify-center">
              <MousePointer2 className="w-8 h-8 text-[#C5F74F] animate-bounce" />
            </span>
          </span>
          <span className="hero-word overflow-hidden inline-block text-[#C5F74F] origin-bottom">HIGHER VIEW</span>
        </h1>

        <p className="hero-cta mt-8 max-w-lg text-lg text-white/60 md:text-xl leading-relaxed">
          The multi-tenant infrastructure designed for the next generation of digital empires.
        </p>

        {/* Buttons */}
        <div className="hero-cta mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button className="group relative h-14 w-full sm:w-48 overflow-hidden rounded-full bg-[#C5F74F] text-black font-bold text-lg transition-transform active:scale-95">
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
            <span className="relative flex items-center justify-center gap-2">
              Start Building <ArrowRight size={18} />
            </span>
          </button>
          <button className="h-14 w-full sm:w-48 rounded-full border border-white/20 hover:bg-white/10 text-white font-medium transition-colors flex items-center justify-center">
            Documentation
          </button>
        </div>
      </div>

      {/* Mobile Only: Simple Stacked Metrics (Replaces floating widgets on small screens) */}
      <div className="md:hidden mt-16 grid grid-cols-2 gap-4 w-full px-6">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
          <BarChart3 className="text-[#C5F74F] mb-2" size={24} />
          <div className="text-2xl font-bold">$842k</div>
          <div className="text-xs text-white/50 uppercase">Revenue</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
          <Zap className="text-red-400 mb-2" size={24} />
          <div className="text-2xl font-bold">24ms</div>
          <div className="text-xs text-white/50 uppercase">Latency</div>
        </div>
      </div>

    </section>
  );
}
