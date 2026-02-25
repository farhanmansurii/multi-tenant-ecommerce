"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function TerminalBrutalist() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Typing effect for terminal
      const text = "initiate  --db postgres  --isolation rls  --start auth,checkout,cart";
      const typingSpan = document.querySelector(".terminal-typing");

      if (typingSpan) {
        typingSpan.innerHTML = "";

        gsap.to(typingSpan, {
          text: {
            value: text,
            speed: 1, // 1 char per frame
          },
          duration: 3,
          ease: "none",
          scrollTrigger: {
            trigger: ".terminal-container",
            start: "top 70%",
          },
          onUpdate: function (this: gsap.core.Tween) {
            typingSpan.innerHTML = text.substring(0, Math.ceil(this.progress() * text.length));
          },
        });
      }

      // Parallax scroll effect for the background text
      gsap.to(".bg-matrix", {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".terminal-container",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // Animate Terminal Window popup
      gsap.from(".terminal-window", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".terminal-window",
          start: "top 80%",
        },
      });
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="terminal-container relative w-full bg-[#EFEFEF] text-[#111] overflow-hidden py-24 md:py-40 flex flex-col items-center justify-center min-h-[90vh]"
    >
      <style>{`
        .font-bricolage { font-family: 'Bricolage Grotesque', sans-serif; }
        .font-space { font-family: 'Space Mono', monospace; }
        .blink { animation: blinker 1s linear infinite; }
        @keyframes blinker { 50% { opacity: 0; } }
      `}</style>

      {/* Extreme Background Typography */}
      <div className="bg-matrix absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.03] overflow-hidden">
        <h2 className="font-bricolage text-[20vw] font-black uppercase leading-[0.8] whitespace-nowrap -ml-24">
          KIOSK CORE
        </h2>
        <h2 className="font-bricolage text-[20vw] font-black uppercase leading-[0.8] whitespace-nowrap ml-32">
          ENGINE V2
        </h2>
        <h2 className="font-bricolage text-[20vw] font-black uppercase leading-[0.8] whitespace-nowrap -ml-40">
          SYSTEM ON
        </h2>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 md:px-12 mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <p className="font-space text-[#FF3300] font-bold tracking-[0.2em] text-sm uppercase mb-4">
            Deployment Protocol
          </p>
          <h2 className="font-bricolage text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.9]">
            Initialize Your <br className="hidden md:block" />
            <span className="text-[#FF3300]">Infrastructure.</span>
          </h2>
          <p className="font-space text-[#555] mt-8 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Stop building authentication, cart logic, and data isolation from scratch. Claim your
            tenant namespace and launch your global platform in seconds.
          </p>
        </div>

        {/* Brutalist Terminal Window */}
        <div className="terminal-window w-full bg-[#111] border-4 border-[#111] shadow-[16px_16px_0_0_#FF3300] md:shadow-[24px_24px_0_0_#FF3300] flex flex-col mb-16 relative">
          {/* Terminal Header */}
          <div className="h-12 border-b-4 border-[#333] flex items-center justify-between px-4 bg-[#1a1a1a]">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-[#FF3300] rounded-none" />
              <div className="w-3 h-3 bg-[#555] rounded-none" />
              <div className="w-3 h-3 bg-[#555] rounded-none" />
            </div>
            <div className="font-space text-[#888] text-xs font-bold uppercase tracking-widest">
              bash // root@kiosk
            </div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>

          {/* Terminal Body */}
          <div className="p-6 md:p-12 font-space text-sm md:text-base xl:text-lg leading-loose text-[#EFEFEF]">
            <div className="text-[#555] mb-4">
              Last login: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()} on
              ttys001
              <br />
              Kiosk Enterprise CLI v2.0.4
            </div>

            <div className="flex items-start">
              <span className="text-[#FF3300] font-bold mr-4 shrink-0">{"~/kiosk"} ❯</span>
              <span className="break-all">
                <span className="terminal-typing text-[#EFEFEF]"></span>
                <span className="inline-block w-2.5 h-4 bg-[#FF3300] ml-1 align-middle blink"></span>
              </span>
            </div>
          </div>
        </div>

        {/* Huge CTA */}
        <div className="flex flex-col items-center justify-center mt-24 md:mt-32">
          <Link
            href="/sign-in"
            className="group relative font-bricolage inline-block text-2xl md:text-4xl text-center uppercase border-[6px] border-[#111] bg-[#FF3300] text-[#111] px-12 py-8 hover:bg-[#111] hover:text-[#EFEFEF] transition-colors duration-300 overflow-hidden"
          >
            <span className="relative z-10 font-black tracking-tight">Access Root System</span>

            {/* Hover overlay that slides in */}
            <div className="absolute inset-0 bg-[#111] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
            <span className="relative z-10 block font-space text-sm tracking-[0.2em] font-bold mt-2 opacity-80 group-hover:opacity-100 group-hover:text-[#FF3300] transition-colors">
              {"// Authenticate Now"}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
