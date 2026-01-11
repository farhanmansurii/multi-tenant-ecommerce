"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FEATURES = [
  {
    number: "01",
    title: "Multi-Tenant",
    subtitle: "Architecture",
    description: "Isolated data, shared infrastructure. Each store operates independently while benefiting from platform-wide optimizations.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop"
  },
  {
    number: "02",
    title: "Real-Time",
    subtitle: "Inventory",
    description: "WebSocket-powered stock updates. Your inventory syncs across all channels instantly, preventing oversells.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop"
  },
  {
    number: "03",
    title: "Edge",
    subtitle: "Optimized",
    description: "Deploy globally on the edge. Sub-50ms response times with automatic failover and zero cold starts.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop"
  }
];

export const Features = () => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Horizontal scroll for features
    const sections = gsap.utils.toArray<HTMLElement>(".feature-panel");

    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => "+=" + (containerRef.current?.offsetWidth || 0) * 2
      }
    });

    // Animate feature numbers
    sections.forEach((section) => {
      gsap.from(section.querySelector(".feature-number"), {
        yPercent: 100,
        opacity: 0,
        scrollTrigger: {
          trigger: section,
          containerAnimation: gsap.getById("horizontal"),
          start: "left center",
          toggleActions: "play none none reverse"
        }
      });
    });

  }, { scope: containerRef });

  return (
    <section id="features" ref={containerRef} className="relative bg-background overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 md:px-12 py-8 flex justify-between items-center pointer-events-none">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
            <span className="w-8 h-[1px] bg-foreground" />
            Core Features
          </p>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          <span className="text-foreground feature-counter">01</span> — 03
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div className="flex w-[300vw] h-screen">
        {FEATURES.map((feature, index) => (
          <div
            key={feature.number}
            className="feature-panel w-screen h-screen flex-shrink-0 flex items-center px-6 md:px-12 relative"
          >
            {/* Large background number */}
            <div className="absolute top-1/2 right-12 -translate-y-1/2 font-grotesk text-[40vh] font-bold text-foreground/[0.02] pointer-events-none select-none">
              {feature.number}
            </div>

            <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center w-full max-w-7xl mx-auto">
              {/* Text content */}
              <div className="relative z-10">
                <div className="overflow-hidden mb-6">
                  <span className="feature-number block font-mono text-sm text-primary">
                    {feature.number}
                  </span>
                </div>

                <h3 className="font-grotesk text-[12vw] md:text-[8vw] font-bold leading-[0.85] tracking-tighter uppercase mb-2">
                  {feature.title}
                </h3>
                <h3 className="font-grotesk text-[12vw] md:text-[8vw] font-bold leading-[0.85] tracking-tighter uppercase mb-8" style={{ WebkitTextStroke: '1.5px currentColor', WebkitTextFillColor: 'transparent' }}>
                  {feature.subtitle}
                </h3>

                <p className="text-lg text-muted-foreground max-w-md leading-relaxed mb-8">
                  {feature.description}
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-foreground" />
                  <span className="font-mono text-xs uppercase tracking-widest">Learn More</span>
                </div>
              </div>

              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden group">
                <div className="absolute inset-0 bg-foreground/5" />
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 border border-foreground/10" />

                {/* Image overlay info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent">
                  <div className="flex justify-between items-end">
                    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {feature.title} {feature.subtitle}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      ↗
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative line */}
            {index < FEATURES.length - 1 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-1/2 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Scroll progress bar */}
      <div className="absolute bottom-8 left-6 md:left-12 right-6 md:right-12 h-[1px] bg-border">
        <div className="feature-progress h-full bg-foreground origin-left" style={{ transform: 'scaleX(0.33)' }} />
      </div>
    </section>
  );
};
