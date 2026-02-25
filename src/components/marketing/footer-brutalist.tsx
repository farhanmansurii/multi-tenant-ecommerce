"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function FooterBrutalist() {
  const container = useRef<HTMLElement>(null);
  const currentYear = new Date().getFullYear();

  useGSAP(
    () => {
      // 1. Footer Parallax/Reveal Effect
      // We start the inner content shifted upward so as you scroll, it slides down into place, creating a reveal illusion
      gsap.from(".footer-inner", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // 1.5 Orange Box Glitch Reveal Overlay
      gsap.to(".scatter-box", {
        opacity: 0,
        backgroundColor: "#111", // Glitch to black before disappearing
        duration: 0.1,
        ease: "power1.in",
        stagger: {
          amount: 0.6,
          from: "random",
        },
        scrollTrigger: {
          trigger: container.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      // 2. KIOSK Scatter Animation
      gsap.from(".scatter-char", {
        x: () => gsap.utils.random(-150, 150),
        y: () => gsap.utils.random(-150, 150),
        rotationZ: () => gsap.utils.random(-90, 90),
        opacity: 0,
        scale: 2,
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.05,
        delay: 0.2, // play slightly after boxes scatter
        scrollTrigger: {
          trigger: container.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      // 3. Link Cascade
      gsap.from(".scatter-link", {
        x: -50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.4,
        scrollTrigger: {
          trigger: ".link-grid",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: container },
  );

  return (
    <footer
      ref={container}
      className="w-full bg-[#111] text-[#EFEFEF] border-t-8 border-[#FF3300] relative overflow-hidden"
    >
      <style>{`
        .font-bricolage { font-family: 'Bricolage Grotesque', sans-serif; }
        .font-space { font-family: 'Space Mono', monospace; }

        @keyframes marquee-footer {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-footer-ticker {
          animation: marquee-footer 20s linear infinite;
        }
      `}</style>

      {/* Inner wrapper for parallax reveal */}
      <div className="footer-inner relative w-full h-full">
        {/* Giant Orange Glitch Overlay Mask */}
        <div className="scatter-overlay absolute inset-0 z-50 grid grid-cols-10 md:grid-cols-20 grid-rows-[repeat(20,minmax(0,1fr))] pointer-events-none overflow-hidden">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="scatter-box w-full h-full bg-[#FF3300]" />
          ))}
        </div>
        {/* Extreme Footer Marquee */}
        <div className="w-full h-10 md:h-12 bg-[#FF3300] text-[#111] flex items-center overflow-hidden border-b-4 border-[#111]">
          <div className="animate-footer-ticker flex whitespace-nowrap font-space text-sm md:text-base font-black uppercase tracking-widest w-full">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="mx-6">
                END OF SIGNAL // CONNECTION TERMINATED // KIOSK CORE V2 //
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[40vh]">
          {/* Left massive block */}
          <div className="lg:col-span-7 flex flex-col justify-between p-8 md:p-16 border-b lg:border-b-0 lg:border-r border-[#333]">
            <div>
              <span className="font-space text-[#FF3300] font-bold tracking-widest uppercase text-xs md:text-sm mb-4 block border-l-4 border-[#FF3300] pl-4">
                Sys. Admin
              </span>
              <Link
                href="/"
                className="font-bricolage text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none hover:text-[#FF3300] transition-colors inline-flex overflow-visible mt-2"
              >
                {"KIOSK".split("").map((char, i) => (
                  <span key={i} className="scatter-char inline-block">
                    {char}
                  </span>
                ))}
              </Link>
              <p className="font-space text-[#888] mt-6 max-w-md text-sm md:text-base leading-relaxed">
                Multi-tenant architecture engineered with extreme prejudice. Draft-to-publish
                theming and database-enforced tenant isolation out of the box.
              </p>
            </div>

            <div className="mt-16 sm:mt-24 lg:mt-32">
              <p className="font-space text-[#555] text-xs md:text-sm uppercase tracking-widest">
                © {currentYear} KIOSK COMMERCE. ALL RIGHTS RESERVED.{" "}
                <br className="hidden sm:block" />
                OPERATING FROM LOCALHOST //
              </p>
            </div>
          </div>

          {/* Right nav grid */}
          <div className="link-grid lg:col-span-5 grid grid-cols-2 md:grid-cols-2">
            {/* Docs Column */}
            <div className="border-r border-b md:border-b-0 border-[#333] p-8 md:p-12 flex flex-col">
              <h4 className="font-space text-[#FF3300] font-bold text-xs md:text-sm tracking-[0.2em] uppercase mb-8">
                {"//"} Documentation
              </h4>
              <ul className="flex flex-col gap-6 font-bricolage text-xl md:text-2xl uppercase font-bold tracking-tight">
                <li className="scatter-link">
                  <Link href="#" className="hover:text-[#FF3300] hover:pl-2 transition-all">
                    Architecture
                  </Link>
                </li>
                <li className="scatter-link">
                  <Link href="#" className="hover:text-[#FF3300] hover:pl-2 transition-all">
                    Tenancy Mode
                  </Link>
                </li>
                <li className="scatter-link">
                  <Link href="#" className="hover:text-[#FF3300] hover:pl-2 transition-all">
                    Deployments
                  </Link>
                </li>
                <li className="scatter-link">
                  <Link href="#" className="hover:text-[#FF3300] hover:pl-2 transition-all">
                    API Specs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div className="p-8 md:p-12 flex flex-col border-b md:border-b-0 border-[#333]">
              <h4 className="font-space text-[#FF3300] font-bold text-xs md:text-sm tracking-[0.2em] uppercase mb-8">
                {"//"} Systems
              </h4>
              <ul className="flex flex-col gap-6 font-bricolage text-xl md:text-2xl uppercase font-bold tracking-tight">
                <li className="scatter-link">
                  <Link
                    href="/sign-in"
                    className="hover:text-[#FF3300] hover:pl-2 transition-all text-[#EFEFEF]"
                  >
                    Access Root
                  </Link>
                </li>
                <li className="scatter-link">
                  <Link
                    href="https://github.com"
                    target="_blank"
                    className="hover:text-[#FF3300] hover:pl-2 transition-all"
                  >
                    GitHub Repo
                  </Link>
                </li>
                <li className="scatter-link">
                  <Link href="#" className="hover:text-[#FF3300] hover:pl-2 transition-all">
                    Status [OK]
                  </Link>
                </li>
                <li className="scatter-link">
                  <Link href="#" className="hover:text-[#FF3300] hover:pl-2 transition-all">
                    Discord Comms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Absolute massive watermark behind content maybe? or at bottom */}
        <div className="w-full border-t border-[#333] py-4 px-6 md:px-16 flex flex-col md:flex-row justify-between items-center font-space text-[10px] md:text-xs text-[#555] uppercase tracking-widest bg-[#0a0a0a]">
          <div>
            <span>Environment: Production</span>
            <span className="mx-4">|</span>
            <span>Security: RLS Enforced</span>
          </div>
          <div className="mt-4 md:mt-0">
            <span>{new Date().toISOString()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
