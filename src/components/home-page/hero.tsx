"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const Hero = () => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Scrubbing text weight & scale on scroll
    gsap.to(".reveal-text", {
      fontWeight: 900,
      letterSpacing: "-0.05em",
      scrollTrigger: {
        trigger: container.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    // 2. Entrance sequence
    const tl = gsap.timeline();
    tl.from(".line-inner", {
      y: "110%",
      duration: 1.2,
      ease: "expo.out",
      stagger: 0.1,
    })
    .from(".hero-image", {
      clipPath: "inset(0 100% 0 0)",
      duration: 1.5,
      ease: "power4.inOut",
    }, "-=1")
    .from(".ui-element", {
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.1,
    }, "-=0.5");

  }, { scope: container });

  return (
    <header ref={container} className="relative min-h-[120vh] bg-[#0a0a0a] text-[#ededed] px-4 pt-32 pb-20">
      {/* Top UI / Navigation Simulation */}
      <div className="ui-element absolute top-8 left-10 right-10 flex justify-between font-mono text-[10px] uppercase tracking-widest opacity-50">
        <span>Platform / 2026</span>
        <span>Available for Scale</span>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-4">
        {/* Main Title - Brutalist Typography */}
        <h1 className="col-span-12 md:col-span-10 text-[12vw] leading-[0.85] uppercase font-light reveal-text italic">
          <div className="overflow-hidden">
            <span className="line-inner block">Engineering</span>
          </div>
          <div className="overflow-hidden flex items-center gap-8">
            <span className="line-inner block text-primary">Digital</span>
            <div className="hero-image h-[8vw] w-[15vw] bg-zinc-800 overflow-hidden rounded-full mt-4">
               <img
                src="https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1000&auto=format&fit=crop"
                className="w-full h-full object-cover scale-150"
                alt="abstract"
               />
            </div>
          </div>
          <div className="overflow-hidden text-right">
            <span className="line-inner block italic underline decoration-1 underline-offset-[10px]">Velocity</span>
          </div>
        </h1>

        {/* Floating Descriptor Block */}
        <div className="col-span-12 md:col-span-4 mt-20 md:mt-0 self-end space-y-8">
          <div className="ui-element flex items-start gap-4 border-l border-primary/30 pl-6">
            <p className="text-sm leading-relaxed text-zinc-400">
              A high-integrity commerce engine built for the next era of decentralized retail.
              Zero latency. Infinite scale.
            </p>
          </div>

          <div className="ui-element flex gap-2">
            <button className="h-12 w-12 rounded-full border border-zinc-700 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors group">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="group-hover:rotate-45 transition-transform">
                <path d="M1 14L14 1M14 1H5M14 1V10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <span className="font-mono text-[10px] uppercase self-center tracking-tighter">Enter the Engine</span>
          </div>
        </div>

        {/* Secondary Visual Section */}
        <div className="col-span-12 md:col-span-7 md:col-start-6 mt-12 relative">
          <div className="hero-image aspect-video w-full bg-zinc-900 overflow-hidden">
             <img
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop"
              className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
              alt="data"
             />
          </div>
          <div className="ui-element absolute -bottom-6 -left-6 bg-primary p-8 hidden md:block">
             <span className="text-black font-bold text-4xl leading-none tracking-tighter uppercase block">99.9%</span>
             <span className="text-black/60 font-mono text-[8px] uppercase tracking-widest">Uptime Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Vertical Side Label */}
      <div className="ui-element fixed right-6 top-1/2 -rotate-90 origin-right font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-600 hidden lg:block">
        Scroll to Explore Modernity
      </div>
    </header>
  );
};
