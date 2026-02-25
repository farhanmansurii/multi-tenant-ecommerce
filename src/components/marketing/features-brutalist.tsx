"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const features = [
  {
    id: "01",
    title: "Postgres RLS",
    subtitle: "TRUE TENANT ISOLATION",
    description:
      "Stop leaking data. Every query is scoped at the database level using Postgres Row Level Security. Even if your application code has a bug, tenants cannot access each other's data.",
  },
  {
    id: "02",
    title: "Draft-to-Publish",
    subtitle: "VERSION CONTROLLED THEMING",
    description:
      "Merchants can safely edit their storefront themes in isolation. Preview changes on a secure draft environment before deploying them live with a single click.",
  },
  {
    id: "03",
    title: "Next.js Core",
    subtitle: "EDGE-READY PERFORMANCE",
    description:
      "Built natively on Next.js App Router. Sub-millisecond response times, edge caching caching, and extreme Core Web Vitals performance out of the box.",
  },
  {
    id: "04",
    title: "Merchant Dashboard",
    subtitle: "COMMAND & CONTROL",
    description:
      "A fully isolated, brandable dashboard for every tenant to manage inventory, process orders, and control their global operations without touching your internal admin.",
  },
];

export function FeaturesBrutalist() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // No need for GSAP pinning, CSS sticky handles it much better natively without blowing out grids

      // Animate each card as it enters
      const cards: Element[] = gsap.utils.toArray(".feature-card");
      cards.forEach((card) => {
        const content = card.querySelector(".feature-card-content");
        if (content) {
          gsap.from(content, {
            y: 100,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
        }

        // Internal card elements
        const title = card.querySelector(".card-title");
        const divider = card.querySelector(".card-divider");

        if (title && divider) {
          gsap.from(divider, {
            scaleX: 0,
            transformOrigin: "left",
            duration: 0.6,
            ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });
        }
      });

      // Animate the main section divider wiping in from the left
      gsap.from(".section-divider", {
        scaleX: 0,
        transformOrigin: "left",
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".features-container",
          start: "top 90%",
          end: "top 20%",
          scrub: 1,
        },
      });
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="features-container relative w-full bg-[#111] text-[#EFEFEF]"
    >
      <style>{`
        .font-bricolage { font-family: 'Bricolage Grotesque', sans-serif; }
        .font-space { font-family: 'Space Mono', monospace; }

        .feature-card {
          --stack-offset: 3.5rem;
          --stack-start: 40vh;
        }
        @media (min-width: 768px) {
          .feature-card {
            --stack-offset: 5rem;
            --stack-start: 0vh;
          }
        }
      `}</style>

      {/* Extreme Section Divider */}
      <div className="section-divider w-full h-[40px] md:h-[80px] bg-[#FF3300] flex items-center overflow-hidden border-y-8 border-[#111]">
        <div className="animate-ticker flex whitespace-nowrap font-space text-sm md:text-xl font-black text-[#111] w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mx-6">
              SYSTEM ARCHITECTURE // INFRASTRUCTURE BREAKDOWN //
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 max-w-[1600px] mx-auto min-h-screen">
        {/* Sticky Left Column */}
        <div className="col-start-1 row-start-1 md:col-start-1 md:col-span-5 md:border-r border-[#333] relative z-20 pointer-events-none md:pointer-events-auto">
          <div className="sticky top-0 w-full flex flex-col justify-center h-[40vh] md:h-screen md:pt-24 md:pb-16 px-6 md:px-16 z-20 bg-[#111] md:bg-transparent border-b md:border-b-0 border-[#333] pointer-events-auto">
            <span className="font-space text-[#FF3300] font-bold tracking-widest uppercase text-xs md:text-sm mb-4 md:mb-6 block border-l-4 border-[#FF3300] pl-4">
              Capability Overview
            </span>
            <h2 className="font-bricolage text-[15vw] md:text-[6vw] font-black uppercase leading-[0.85] tracking-tight text-[#EFEFEF]">
              Surgical <br />
              Precision.
            </h2>
            <p className="font-space text-[#888] mt-4 md:mt-8 max-w-sm text-xs sm:text-sm md:text-base leading-relaxed hidden sm:block">
              Every system component is engineered for isolation, redundancy, and developer
              ergonomics. Reclaim your focus.
            </p>

            <div className="mt-16 hidden md:block">
              {/* Abstract decorative technical element */}
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-[spin_20s_linear_infinite] opacity-20"
              >
                <path d="M60 0L120 60L60 120L0 60L60 0Z" stroke="#FF3300" strokeWidth="2" />
                <circle
                  cx="60"
                  cy="60"
                  r="40"
                  stroke="#EFEFEF"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <circle cx="60" cy="60" r="20" stroke="#FF3300" strokeWidth="2" />
                <path d="M60 40V80M40 60H80" stroke="#EFEFEF" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Scrolling Right Column */}
        <div className="col-start-1 row-start-1 md:col-start-6 md:col-span-7 flex flex-col relative pb-12 md:pb-32 bg-[#111] md:bg-transparent pt-[40vh] md:pt-0">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="feature-card sticky bg-[#111] border-[#333] shadow-[0_-15px_40px_rgba(0,-0,0,0.9)] hover:bg-[#181818] transition-colors duration-500 overflow-hidden"
              style={{
                top: `calc(var(--stack-start) + ${index} * var(--stack-offset))`,
                zIndex: index + 10,
                marginTop: index === 0 ? "0px" : "-1px", // Eliminate any gaps
                borderTopWidth: "1px",
              }}
            >
              <div className="feature-card-content min-h-[50vh] xl:min-h-[40vh] w-full pb-12 pt-8 md:pt-14 px-6 md:px-16 relative">
                <div className="absolute -top-4 right-4 md:right-8 font-bricolage text-[10rem] md:text-[14rem] font-black text-[#1a1a1a] leading-none pointer-events-none z-0">
                  {feature.id}
                </div>

                <div className="relative z-10 w-full max-w-xl">
                  <p className="font-space text-[#FF3300] font-bold text-xs md:text-sm tracking-[0.2em] mb-4">
                    {"// "}
                    {feature.subtitle}
                  </p>
                  <h3 className="card-title font-bricolage text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 md:mb-8 text-white">
                    {feature.title}
                  </h3>

                  <div className="card-divider w-24 h-2 bg-[#FF3300] mb-6 md:mb-8" />

                  <p className="font-space text-[#aaa] text-sm md:text-base leading-loose">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
