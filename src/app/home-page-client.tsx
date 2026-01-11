"use client";

import { useRef, useEffect } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
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
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);
}

// --- MAIN PAGE ---

export default function KioskPure() {
  const container = useRef<HTMLDivElement>(null);

  // Lenis Smooth Scroll
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

    // Sync Lenis with ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={container} className={`${manrope.variable} ${spaceGrotesk.variable} font-sans bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden`}>

      {/* --- PRELOADER --- */}
      <Preloader onComplete={() => {}} />

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
