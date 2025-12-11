"use client";

import React, { useRef, useEffect, useState } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { Preloader } from "@/components/home-page/preloader";
import { Navbar } from "@/components/home-page/navbar";
import { Hero } from "@/components/home-page/hero";
import { Features } from "@/components/home-page/features";
import { TextReveal } from "@/components/home-page/text-reveal";
import { Footer } from "@/components/home-page/footer";

// --- FONTS ---
const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// --- MAIN PAGE ---

export default function KioskPure() {
  const container = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // 1. Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  return (
    <div ref={container} className={`${manrope.variable} ${spaceGrotesk.variable} font-sans bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden`}>

      {/* --- PRELOADER --- */}
      <Preloader onComplete={() => setLoading(false)} />

      {/* --- NAV --- */}
      <Navbar />

      {/* --- HERO --- */}
      <Hero />

      {/* --- FEATURES (THE STACK) --- */}
      <Features />

      {/* --- BIG TEXT BREAK --- */}
      <TextReveal />

      {/* --- FOOTER (Your Favorite) --- */}
      <Footer />

    </div>
  );
}
