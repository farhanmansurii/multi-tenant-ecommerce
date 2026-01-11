"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const TextReveal = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Split text reveal
    const chars = gsap.utils.toArray<HTMLElement>(".reveal-char");

    chars.forEach((char) => {
      gsap.from(char, {
        opacity: 0.1,
        scrollTrigger: {
          trigger: char,
          start: "top 85%",
          end: "top 50%",
          scrub: 1
        }
      });
    });

    // Counter stats animation
    gsap.utils.toArray<HTMLElement>(".stat-value").forEach(stat => {
      gsap.from(stat, {
        textContent: 0,
        duration: 2,
        ease: "power1.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: stat,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Horizontal line animation
    gsap.from(".reveal-line-h", {
      scaleX: 0,
      duration: 1.5,
      ease: "power4.inOut",
      scrollTrigger: {
        trigger: ".reveal-line-h",
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });

  }, { scope: sectionRef });

  const sentence = "We believe commerce should be fast, beautiful, and accessible to everyone.";
  const words = sentence.split(" ");

  return (
    <section ref={sectionRef} id="stack" className="relative py-32 md:py-48 bg-background">
      {/* Top border with label */}
      <div className="px-6 md:px-12 mb-24">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Philosophy</span>
          <div className="reveal-line-h flex-1 h-[1px] bg-border origin-left" />
        </div>
      </div>

      {/* Main text */}
      <div className="px-6 md:px-12 mb-24">
        <p className="font-grotesk text-[7vw] md:text-[5vw] font-bold leading-[1.1] tracking-tight max-w-6xl">
          {words.map((word, i) => (
            <span key={i} className="reveal-char inline-block mr-[0.25em]">
              {word}
            </span>
          ))}
        </p>
      </div>

      {/* Stats grid */}
      <div className="px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pt-12 border-t border-border">
          <div>
            <p className="font-grotesk text-5xl md:text-7xl font-bold mb-2">
              <span className="stat-value" data-value="99">99</span>
              <span className="text-primary">%</span>
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Uptime Guaranteed</p>
          </div>
          <div>
            <p className="font-grotesk text-5xl md:text-7xl font-bold mb-2">
              <span className="stat-value" data-value="50">50</span>
              <span className="text-primary">ms</span>
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Global Response</p>
          </div>
          <div>
            <p className="font-grotesk text-5xl md:text-7xl font-bold mb-2">
              <span className="stat-value" data-value="100">100</span>
              <span className="text-primary">+</span>
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Integrations</p>
          </div>
          <div>
            <p className="font-grotesk text-5xl md:text-7xl font-bold mb-2">
              <span className="stat-value" data-value="24">24</span>
              <span className="text-primary">/7</span>
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Expert Support</p>
          </div>
        </div>
      </div>

      {/* Decorative */}
      <div className="absolute top-32 right-6 md:right-12 font-mono text-xs text-muted-foreground writing-vertical">
        Manifesto
      </div>

      <style jsx>{`
        .writing-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </section>
  );
};
