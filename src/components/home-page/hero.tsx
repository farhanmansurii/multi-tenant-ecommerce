"use client";

import React from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const Hero = () => {
  useGSAP(() => {
    // B. Parallax Image in Hero
    gsap.to(".hero-img", {
      yPercent: 30,
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  });

  return (
    <header className="hero-section relative h-screen px-6 md:px-12 flex flex-col justify-center pt-20">
      <div className="absolute top-0 right-[15%] w-[1px] h-full bg-border" />
      <div className="absolute top-0 left-[15%] w-[1px] h-full bg-border" />

      {/* Background Abstract */}
      <div className="hero-img absolute right-0 top-1/4 w-[40vw] h-[60vh] opacity-40 z-0">
        <img
          src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop"
          alt="Abstract"
          className="object-cover grayscale w-full h-full"
        />
      </div>

      <div className="relative z-10">
        <div className="font-mono text-primary text-xs uppercase tracking-[0.2em] mb-6 hero-sub flex items-center gap-4">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          System V2.0 Online
        </div>

        <h1 className="font-grotesk text-[14vw] leading-[0.8] font-bold tracking-tighter uppercase overflow-hidden">
          <div className="flex"><span className="hero-title-char">Unified</span></div>
          <div className="flex pl-[10vw] text-primary"><span className="hero-title-char">Commerce</span></div>
          <div className="flex"><span className="hero-title-char">Engine</span></div>
        </h1>
      </div>

      <div className="absolute bottom-12 left-6 md:left-12 max-w-md hero-sub">
        <p className="text-lg text-muted-foreground leading-relaxed font-light mb-6">
          The infrastructure for the next generation of digital business.
          Built on <span className="text-foreground">Next.js 16</span> and <span className="text-foreground">Drizzle</span>.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="px-6 py-3 rounded-full border border-foreground/20 bg-foreground/5 hover:bg-foreground hover:text-background transition-all font-mono text-xs uppercase tracking-widest"
          >
            Sign In
          </Link>
          <Link
            href="/sign-in"
            className="px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-mono text-xs uppercase tracking-widest"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};
