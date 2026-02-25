"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function HeroBrutalist() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Lock scrolling initially
      document.body.style.overflow = "hidden";

      const tl = gsap.timeline();

      // 2. Preloader Sequence
      // Create an object to hold the loading value since we can't directly animate innerHTML numbers easily without it
      const counterLoader = { val: 0 };

      tl.to(counterLoader, {
        val: 100,
        duration: 1.8,
        ease: "power3.inOut",
        onUpdate: () => {
          const counterEl = document.querySelector(".preloader-counter");
          if (counterEl) {
            // Format as 001%, 045%, 100%
            counterEl.innerHTML = String(Math.floor(counterLoader.val)).padStart(3, "0") + "%";
          }
        },
      })

        // Slide up the 4 brutalist panels sequentially
        .to(".preloader-panel", {
          height: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power4.inOut",
          delay: 0.2,
        })

        // Hide the preloader container
        .to(
          ".preloader",
          {
            autoAlpha: 0,
            duration: 0.1,
            onComplete: () => {
              // Unlock scrolling
              document.body.style.overflow = "";
            },
          },
          "-=0.3",
        )

        // 3. Brutalist Hero Entrance Animation
        .from(
          ".brutalist-text",
          {
            yPercent: 120,
            duration: 0.8,
            stagger: 0.1,
            ease: "power4.out",
          },
          "-=0.2",
        )
        .from(
          ".brutalist-border",
          {
            scaleX: 0,
            transformOrigin: "left",
            duration: 0.8,
            ease: "expo.out",
          },
          "-=0.6",
        )
        .from(
          ".brutalist-fade",
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.4",
        )
        .fromTo(
          ".brutalist-img",
          {
            scale: 1.1,
            filter: "grayscale(100%)",
            opacity: 0,
          },
          {
            scale: 1,
            filter: "grayscale(0%)",
            opacity: 1,
            duration: 1.2,
            ease: "power2.out",
          },
          "-=0.8",
        );

      // 4. Continuous 3D rotation for the brutalist cube
      gsap.to(".brutalist-cube", {
        rotationX: 360,
        rotationY: 720,
        rotationZ: 180,
        duration: 25,
        repeat: -1,
        ease: "none",
      });
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="relative w-full min-h-screen bg-[#EFEFEF] text-[#111] overflow-hidden"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Space+Mono:wght@700&display=swap');
        .font-bricolage { font-family: 'Bricolage Grotesque', sans-serif; }
        .font-space { font-family: 'Space Mono', monospace; }

        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker-scroll 15s linear infinite;
        }

        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }

        .face-front  { transform: translateZ(4rem); }
        .face-back   { transform: rotateY(180deg) translateZ(4rem); }
        .face-right  { transform: rotateY(90deg) translateZ(4rem); }
        .face-left   { transform: rotateY(-90deg) translateZ(4rem); }
        .face-top    { transform: rotateX(90deg) translateZ(4rem); }
        .face-bottom { transform: rotateX(-90deg) translateZ(4rem); }

        @media (min-width: 768px) {
          .face-front  { transform: translateZ(6rem); }
          .face-back   { transform: rotateY(180deg) translateZ(6rem); }
          .face-right  { transform: rotateY(90deg) translateZ(6rem); }
          .face-left   { transform: rotateY(-90deg) translateZ(6rem); }
          .face-top    { transform: rotateX(90deg) translateZ(6rem); }
          .face-bottom { transform: rotateX(-90deg) translateZ(6rem); }
        }
      `}</style>

      {/* --- PRELOADER --- */}
      <div className="preloader fixed inset-0 z-50 flex pointer-events-none">
        {/* 4 dark panels that will slide up to reveal the site */}
        <div className="preloader-panel w-1/4 h-full bg-[#111] border-r border-[#333]" />
        <div className="preloader-panel w-1/4 h-full bg-[#111] border-r border-[#333]" />
        <div className="preloader-panel w-1/4 h-full bg-[#111] border-r border-[#333]" />
        <div className="preloader-panel w-1/4 h-full bg-[#111] relative">
          {/* Loading Counter */}
          <div className="absolute bottom-8 right-4 md:bottom-12 md:right-12 text-[#FF3300] font-bricolage text-5xl md:text-8xl lg:text-9xl tracking-tighter">
            <span className="preloader-counter">000%</span>
          </div>
          {/* System Label */}
          <div className="absolute top-8 right-4 md:top-12 md:right-12 text-white font-space text-[10px] md:text-sm uppercase tracking-widest border-l-4 border-[#FF3300] pl-4">
            Loading Kiosk <br />
            [Please Wait]
          </div>
        </div>
      </div>

      {/* --- HERO CONTENT --- */}

      {/* Top Header Bar Overlay */}
      <div className="absolute inset-x-0 top-0 min-h-14 py-3 md:py-0 md:h-14 border-b-4 border-[#111] flex flex-col md:flex-row items-center justify-center md:justify-between px-4 md:px-12 font-space text-[10px] md:text-sm font-bold uppercase tracking-widest z-20 bg-[#EFEFEF] gap-2 md:gap-0">
        <span className="hidden md:inline-block">Sect. 01 // System Architecture</span>
        <span className="brutalist-text text-center text-[#FF3300]">Kiosk Multi-Tenant Core</span>
        <span className="hidden md:inline-block">Auth // RLS // Drafts</span>
      </div>

      {/* Main Layout Grid */}
      <div className="pt-24 pb-20 md:pt-24 md:pb-12 px-5 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 min-h-screen relative z-10 items-center overflow-x-hidden md:overflow-x-visible">
        {/* Left Column: Massive Text & CTA */}
        <div className="md:col-span-8 flex flex-col justify-center pt-8 pb-4 md:pb-12 z-10 w-full h-full relative">
          <h1 className="font-bricolage text-[19vw] sm:text-[16vw] md:text-[8vw] leading-[0.85] tracking-tight uppercase m-0 max-w-full">
            <span className="block overflow-hidden pb-1 md:pb-3">
              <span className="brutalist-text block">Scale Your</span>
            </span>
            <span className="block overflow-hidden pb-2 md:pb-4">
              <span className="brutalist-text block text-[#FF3300]">Platform.</span>
            </span>
          </h1>

          <div className="brutalist-border w-full max-w-[90%] h-[4px] bg-[#111] my-8 md:my-14" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 w-full md:max-w-[90%]">
            <p className="brutalist-fade font-space text-sm md:text-lg leading-relaxed text-[#333]">
              Stop rebuilding the same infrastructure. Kiosk handles draft-to-publish theming,
              merchant dashboards, and true Postgres tenant isolation out of the box so you can
              build your actual product.
            </p>
            <div className="flex flex-col gap-4 justify-start">
              <Link
                href="/sign-in"
                className="brutalist-fade group relative font-bricolage w-full h-fit text-xl md:text-2xl uppercase border-[4px] border-[#111] bg-[#111] text-white px-8 py-6 hover:bg-[#FF3300] hover:border-[#FF3300] transition-colors duration-300 flex items-center justify-between overflow-hidden"
              >
                <span className="relative z-10">Start Building</span>
                <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300 font-space text-3xl font-black">
                  →
                </span>
              </Link>
              <button className="brutalist-fade group font-space font-bold w-full h-fit text-sm uppercase border-[4px] border-[#111] px-6 py-4 hover:bg-[#111] hover:text-white transition-colors duration-300 text-center">
                Read The Docs
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Animated Cube */}
        <div className="md:col-span-4 h-[40vh] min-h-[300px] md:h-[75vh] md:min-h-[400px] relative flex flex-col items-center justify-center mt-6 md:mt-0 mb-16 md:mb-0 perspective-1000 w-full max-w-[400px] mx-auto md:max-w-none">
          <div className="relative w-full h-full max-h-[700px] bg-[#222] brutalist-img overflow-hidden border-[6px] md:border-[16px] border-[#111] flex flex-col items-center justify-center border-l-[#FF3300]">
            {/* 3D Cube Container */}
            <div className="relative w-24 h-24 md:w-48 md:h-48 preserve-3d brutalist-cube">
              {/* Front */}
              <div className="absolute inset-0 border-4 border-[#FF3300] bg-[#111]/90 flex flex-col items-center justify-center face-front shadow-[inset_0_0_20px_rgba(255,51,0,0.2)]">
                <span className="font-bricolage text-2xl md:text-5xl text-[#EFEFEF]">KIOSK</span>
              </div>
              {/* Back */}
              <div className="absolute inset-0 border-4 border-[#FF3300] bg-[#111]/90 flex items-center justify-center face-back">
                <span className="font-bricolage text-3xl md:text-6xl text-[#EFEFEF]">v2.0</span>
              </div>
              {/* Right */}
              <div className="absolute inset-0 border-4 border-[#FF3300] bg-[#EFEFEF]/10 flex items-center justify-center face-right backdrop-blur-sm">
                <div className="w-1/2 h-1/2 border-2 border-[#FF3300]" />
              </div>
              {/* Left */}
              <div className="absolute inset-0 border-4 border-[#FF3300] bg-[#EFEFEF]/10 flex items-center justify-center face-left backdrop-blur-sm">
                <div className="w-1/2 h-1/2 border-2 border-[#FF3300] rotate-45" />
              </div>
              {/* Top */}
              <div className="absolute inset-0 border-4 border-[#111] bg-[#FF3300] face-top flex items-center justify-center">
                <span className="font-space font-black text-[#111] text-sm md:text-base">SYS.</span>
              </div>
              {/* Bottom */}
              <div className="absolute inset-0 border-4 border-[#111] bg-[#FF3300] face-bottom flex items-center justify-center" />
            </div>

            {/* Large Section Number inside the frame */}
            <div className="absolute -top-1 -right-1 md:-top-4 md:-right-4 font-bricolage text-[10rem] md:text-[15rem] leading-none text-white opacity-[0.03] font-black pointer-events-none select-none z-[-1]">
              01
            </div>
          </div>

          {/* Brutalist Coordinates / Badge */}
          <div className="absolute -bottom-6 left-0 md:-left-12 md:bottom-16 bg-[#111] text-[#EFEFEF] p-4 md:p-8 brutalist-fade font-space text-[10px] md:text-sm uppercase tracking-widest border-4 border-[#FF3300] shadow-[8px_8px_0_0_#FF3300] md:shadow-[12px_12px_0_0_#FF3300] text-left z-20">
            <p>Data Isolation</p>
            <p className="mt-1 md:mt-2 text-[#FF3300] font-bold">RLS Enabled</p>
          </div>
        </div>
      </div>
    </section>
  );
}
