"use client";

import React, { useRef } from "react";
import {
  ArrowUpRight,
  Cpu,
  Database,
  Layers
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

// --- 2. 3D STACKING CARDS (The "Pro" Stack Section) ---
// This replaces the basic slider with a vertical sticky stack interaction.
// Add this to your tailwind.css or global css for the noise texture
// .bg-noise { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E"); }

export const TechStack = () => {
  const container = useRef<HTMLDivElement>(null);

  const cards = [
    {
      title: "Next.js 16",
      id: "01",
      tag: "INFRASTRUCTURE",
      desc: "Server Actions & RSC architecture for zero-latency mutations. The backbone of modern commerce.",
      bg: "bg-[#0f0f0f]",
      text: "text-white",
      accent: "border-white/20",
      icon: <Cpu className="w-full h-full text-white" />
    },
    {
      title: "Drizzle ORM",
      id: "02",
      tag: "DATA LAYER",
      desc: "Type-safe SQL that maps your multi-tenant data with surgical precision. No guessing, just types.",
      bg: "bg-[#C5F74F]",
      text: "text-black",
      accent: "border-black/10",
      icon: <Database className="w-full h-full text-black" />
    },
    {
      title: "PostgreSQL",
      id: "03",
      tag: "STORAGE",
      desc: "Row-level security ensuring total isolation between your tenants. Scalable, ACID compliant, robust.",
      bg: "bg-[#e1e1e1]",
      text: "text-black",
      accent: "border-black/10",
      icon: <Layers className="w-full h-full text-black" />
    }
  ];

  useGSAP(() => {
    if (!container.current) return;

    const cardsEl = gsap.utils.toArray<HTMLElement>(".stack-card");

    // Create a master timeline linked to scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top top",
        end: "+=300%", // Longer scroll distance for smoother feel
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      }
    });

    cardsEl.forEach((card, i) => {
      // 1. Initial State: Cards are fanned out and pushed down
      gsap.set(card, {
        y: 800,
        rotateX: 45,
        rotateY: i % 2 === 0 ? -15 : 15, // Alternate rotation
        scale: 0.8,
        z: -500,
        opacity: 0
      });

      // 2. Animation: They fly in, straighten up, and stack
      tl.to(card, {
        y: i * 15, // Slight offset for the stack look
        rotateX: 0,
        rotateY: 0,
        scale: 1 - (i * 0.02), // Slight scale difference to show depth
        z: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
      }, i * 0.8); // Stagger the entry based on scroll position
    });

  }, { scope: container });

  return (
    <section ref={container} className="relative h-screen w-full bg-[#050505] overflow-hidden flex flex-col items-center justify-center perspective-1000">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none" />

      {/* Section Header (Fixed in background) */}
      <div className="absolute top-12 left-0 w-full text-center z-0">
        <h2 className="text-[12vw] font-bold text-white/5 leading-none tracking-tighter select-none">
          ARCHITECTURE
        </h2>
      </div>

      <div className="relative w-full max-w-5xl h-[60vh] flex items-center justify-center preserve-3d">
        {cards.map((card, i) => (
          <div
            key={i}
            className={cn(
              "stack-card absolute top-0 left-0 w-full h-full rounded-[2rem] p-10 flex flex-col justify-between overflow-hidden shadow-2xl border transition-colors will-change-transform",
              card.bg, card.text, card.accent
            )}
            style={{
              transformStyle: "preserve-3d",
              // Generate a slight random Z-index to prevent flickering, though GSAP handles the main z
              zIndex: i + 1
            }}
          >
            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none mix-blend-overlay" />

            {/* Top Row */}
            <div className="relative z-10 flex justify-between items-center border-b border-current/10 pb-6">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs border border-current/20 px-3 py-1 rounded-full">{card.id}</span>
                <span className="font-mono text-sm tracking-widest uppercase opacity-60">{card.tag}</span>
              </div>
              <div className="w-12 h-12 opacity-80">
                {card.icon}
              </div>
            </div>

            {/* Middle Content */}
            <div className="relative z-10 mt-auto">
              <h3 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-6">
                {card.title}
              </h3>
              <div className="flex items-end justify-between">
                <p className="max-w-md text-lg md:text-xl font-mono leading-relaxed opacity-70">
                  {card.desc}
                </p>
                <ArrowUpRight className="hidden md:block w-12 h-12 opacity-50" />
              </div>
            </div>

            {/* Decorative Holographic Shine (Optional) */}
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rotate-45" />
          </div>
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 text-white/30 font-mono text-xs animate-pulse">
        SCROLL TO DEPLOY
      </div>
    </section>
  );
};
