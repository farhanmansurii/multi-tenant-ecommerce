"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const LINKS = [
  { label: "Documentation", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Discord", href: "#" },
  { label: "Twitter", href: "#" },
];

export const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Big text parallax
    gsap.to(".footer-title", {
      yPercent: -20,
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });

    // Links stagger reveal
    gsap.from(".footer-link", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".footer-links",
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });

    // Line reveal
    gsap.from(".footer-line", {
      scaleX: 0,
      duration: 1.5,
      ease: "power4.inOut",
      scrollTrigger: {
        trigger: ".footer-line",
        start: "top 90%",
        toggleActions: "play none none reverse"
      }
    });

  }, { scope: footerRef });

  const scrollToTop = () => {
    gsap.to(window, {
      duration: 1.5,
      scrollTo: { y: 0 },
      ease: "power4.inOut"
    });
  };

  return (
    <footer ref={footerRef} className="relative bg-foreground text-background min-h-screen flex flex-col">
      {/* Top section */}
      <div className="flex-1 px-6 md:px-12 pt-24 pb-12 flex flex-col justify-between">
        {/* Header row */}
        <div className="flex justify-between items-start mb-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-background/40 mb-4">
              Get in touch
            </p>
            <a
              href="mailto:hello@kiosk.dev"
              className="text-2xl md:text-4xl font-grotesk font-bold hover:text-background/70 transition-colors"
            >
              hello@kiosk.dev
            </a>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-background/40 mb-4">
              Location
            </p>
            <p className="font-mono text-sm text-background/60">
              Mumbai, India<br />
              IST Timezone
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="footer-links grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="footer-link group flex items-center justify-between py-4 border-b border-background/10 hover:border-background/40 transition-colors"
            >
              <span className="font-mono text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                {link.label}
              </span>
              <span className="text-background/40 group-hover:text-background transition-colors">↗</span>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="footer-line h-[1px] bg-background/20 origin-left mb-12" />

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-background/40 mb-4">
              Ready to start?
            </p>
            <Link
              href="/sign-in"
              className="group inline-flex items-center gap-4"
            >
              <span className="font-grotesk text-3xl md:text-5xl font-bold group-hover:text-background/70 transition-colors">
                Create your store
              </span>
              <span className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-background/30 flex items-center justify-center group-hover:bg-background group-hover:text-foreground transition-all duration-500">
                <svg width="20" height="20" viewBox="0 0 14 14" fill="none" className="rotate-[-45deg] group-hover:rotate-0 transition-transform duration-500">
                  <path d="M1 13L13 1M13 1H1M13 1V13" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </span>
            </Link>
          </div>

          <button
            onClick={scrollToTop}
            className="group flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-background/40 hover:text-background transition-colors"
          >
            Back to top
            <span className="w-8 h-8 rounded-full border border-background/30 flex items-center justify-center group-hover:bg-background group-hover:text-foreground transition-all duration-300">
              ↑
            </span>
          </button>
        </div>
      </div>

      {/* Big title */}
      <div className="relative overflow-hidden border-t border-background/10">
        <div className="footer-title py-8 md:py-12">
          <h2 className="font-grotesk text-[25vw] md:text-[20vw] font-bold leading-none tracking-tighter text-center uppercase whitespace-nowrap">
            KIOSK
          </h2>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-6 md:px-12 py-6 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-mono text-xs text-background/40">
          © 2025 Kiosk Inc. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link href="#" className="font-mono text-xs text-background/40 hover:text-background transition-colors">Privacy</Link>
          <Link href="#" className="font-mono text-xs text-background/40 hover:text-background transition-colors">Terms</Link>
          <span className="font-mono text-xs text-background/40">
            Built with Next.js
          </span>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-24 left-6 md:left-12 flex gap-1">
        <div className="w-2 h-2 bg-background" />
        <div className="w-2 h-2 border border-background/30" />
      </div>
    </footer>
  );
};
