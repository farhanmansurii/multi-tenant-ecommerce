"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Navbar = () => {
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useGSAP(() => {
    // Initial reveal (synced with preloader)
    gsap.from(".nav-logo", {
      y: -20,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 2.8
    });

    gsap.from(".nav-item", {
      y: -15,
      opacity: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: "power2.out",
      delay: 3
    });

    // Scroll behavior
    let lastScrollY = 0;

    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        const scrollY = self.scroll();
        const direction = scrollY > lastScrollY ? "down" : "up";

        if (scrollY > 100) {
          setIsScrolled(true);
          if (direction === "down" && scrollY > 300) {
            gsap.to(navRef.current, {
              yPercent: -100,
              duration: 0.4,
              ease: "power2.inOut"
            });
          } else {
            gsap.to(navRef.current, {
              yPercent: 0,
              duration: 0.4,
              ease: "power2.out"
            });
          }
        } else {
          setIsScrolled(false);
          gsap.to(navRef.current, {
            yPercent: 0,
            duration: 0.3
          });
        }

        lastScrollY = scrollY;
      }
    });

  }, { scope: navRef });

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center transition-all duration-500 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border"
          : "mix-blend-difference"
      }`}
    >
      <Link
        href="/"
        className="nav-logo font-grotesk font-bold text-xl uppercase tracking-tight text-white"
      >
        Kiosk
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <Link
          href="#features"
          className="nav-item font-mono text-xs uppercase tracking-widest text-white/80 hover:text-white transition-colors"
        >
          Features
        </Link>
        <Link
          href="#stack"
          className="nav-item font-mono text-xs uppercase tracking-widest text-white/80 hover:text-white transition-colors"
        >
          Stack
        </Link>
        <Link
          href="/sign-in"
          className="nav-item font-mono text-xs uppercase tracking-widest text-white/80 hover:text-white transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-in"
          className="nav-item ml-4 px-5 py-2.5 border border-white/30 rounded-full font-mono text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300"
        >
          Get Started
        </Link>
      </div>

      {/* Mobile */}
      <Link
        href="/sign-in"
        className="nav-item md:hidden px-4 py-2 border border-white/30 rounded-full font-mono text-xs uppercase tracking-widest text-white"
      >
        Start
      </Link>
    </nav>
  );
};
