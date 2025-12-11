"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hexagon, Box, Circle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const CARDS = [
  {
    id: "card-1",
    title: "Multi-Tenant Architecture",
    desc: "Isolated stores, unified dashboard. The most scalable way to build commerce platforms.",
    tag: "Database Sharding Ready",
    icon: <Hexagon size={28} />,
    colorClass: "bg-card text-card-foreground border-border",
    iconBg: "bg-primary/10 text-primary",
    code: (
      <div className="font-mono text-xs text-muted-foreground space-y-2">
        <p className="text-primary mb-2 opacity-50">// config.ts</p>
        <p>tenant_id: "store_01"</p>
        <p>db_host: "us-east-1"</p>
        <p>status: <span className="text-green-500">active</span></p>
      </div>
    )
  },
  {
    id: "card-2",
    title: "Inventory Sync",
    desc: "Real-time mutation management via React Query. Never oversell again.",
    tag: "Optimistic UI Updates",
    icon: <Box size={28} />,
    colorClass: "bg-secondary text-secondary-foreground border-border/10", // Dark card
    iconBg: "bg-white/10 text-white",
    code: (
      <div className="grid grid-cols-2 gap-3 w-full opacity-80 font-mono text-xs">
        <div className="bg-black/20 p-3 rounded text-center text-white/50">SKU-991</div>
        <div className="bg-primary text-primary-foreground p-3 rounded text-center font-bold">12 Left</div>
        <div className="bg-black/20 p-3 rounded text-center text-white/50">SKU-882</div>
        <div className="bg-red-500/20 text-red-200 border border-red-500/20 p-3 rounded text-center">Sold Out</div>
      </div>
    )
  },
  {
    id: "card-3",
    title: "Tailwind v4 Engine",
    desc: "Styled with the latest engine. Zero runtime, CSS variables for theming.",
    tag: "Shadcn UI Components",
    icon: <Circle size={28} />,
    colorClass: "bg-primary text-primary-foreground border-primary", // Ochre card
    iconBg: "bg-black/10 text-black",
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
  }
];

export const Features = () => {
  const container = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    const totalScrollHeight = window.innerHeight * 3; // Scroll distance to get through cards

    // Pin the whole container
    ScrollTrigger.create({
      trigger: container.current,
      start: "top top",
      end: `+=${totalScrollHeight}`,
      pin: true,
      pinSpacing: true,
      scrub: 1, // Add scrub smoothing (1s delay) for weight
    });

    // Animate Cards
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top top",
        end: `+=${totalScrollHeight}`,
        scrub: 1,
      }
    });

    // CARD 2 Animation (Slides over Card 1)
    timeline.fromTo(cardRefs.current[1],
      { yPercent: 100, scale: 0.9 }, // Start from bottom
      { yPercent: 4, scale: 1, ease: "none" } // End slightly overlapping top
    );

    // While Card 2 slides up, Card 1 shrinks
    timeline.to(cardRefs.current[0], {
      scale: 0.95,
      ease: "none"
    }, "<"); // "<" syncs with previous animation

    // CARD 3 Animation (Slides over Card 2)
    timeline.fromTo(cardRefs.current[2],
      { yPercent: 100, scale: 0.9 },
      { yPercent: 8, scale: 1, ease: "none" }
    );

    // While Card 3 slides up, Card 2 shrinks
    timeline.to(cardRefs.current[1], {
      scale: 0.95,
      ease: "none"
    }, "<");

  }, { scope: container });

  return (
    <section className="relative bg-background">
      {/* The container acts as the viewport.
         Height is 100vh because it gets pinned.
      */}
      <div ref={container} className="h-screen w-full flex items-center justify-center overflow-hidden relative">

        {/* Header (Absolute so it stays at top while cards move) */}
        <div className="absolute top-12 left-6 md:left-12 z-50 w-full pr-12 md:pr-24 flex justify-between items-end pointer-events-none">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary mb-2">(01) Platform</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground">Core Modules</h2>
          </div>
          <div className="hidden md:block font-mono text-xs text-muted-foreground animate-pulse">
            SCROLL TO EXPLORE ↓
          </div>
        </div>

        {/* CARDS CONTAINER */}
        <div className="relative w-full max-w-5xl h-[60vh] md:h-[70vh] px-6">
          {CARDS.map((card, index) => (
            <div
              key={card.id}
              ref={(el) => { cardRefs.current[index] = el }}
              className={cn(
                "absolute top-0 left-0 w-full h-full rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row gap-12 overflow-hidden border shadow-2xl origin-top",
                card.colorClass
              )}
              // We set z-index so HTML order doesn't mess up stacking
              style={{ zIndex: index + 1 }}
            >
              {/* Content Left */}
              <div className="flex-1 flex flex-col justify-between relative z-10">
                <div>
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8", card.iconBg)}>
                    {card.icon}
                  </div>
                  <h3 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-[0.9]">
                    {card.title}
                  </h3>
                  <p className="text-lg md:text-xl opacity-80 max-w-sm leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest opacity-60 mt-8">
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {card.tag}
                </div>
              </div>

              {/* Visual Right */}
              <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/5 flex items-center justify-center">
                {card.img ? (
                  <img
                    src={card.img}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                  />
                ) : (
                  // Code/Abstract Visual container
                  <div className="relative w-full h-full p-8 flex items-center justify-center">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-[0.05]"
                      style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>
                    <div className="relative z-10 transform transition-transform duration-500 hover:scale-105">
                      {card.code}
                    </div>
                  </div>
                )}

                {/* Corner Decoration */}
                <div className="absolute top-4 right-4 opacity-20">
                  <ArrowUpRight />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
