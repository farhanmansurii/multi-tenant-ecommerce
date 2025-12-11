"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const ScrollTriggerArrow = () => (
  <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
    <div className="border border-primary-foreground rounded-full p-2 hover:bg-primary-foreground hover:text-primary transition-colors">
      <ArrowUpRight size={16} />
    </div>
  </div>
);

export const Footer = () => {
  return (
    <footer className="relative min-h-screen bg-primary text-primary-foreground pt-32 px-6 md:px-12 flex flex-col justify-between overflow-hidden">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-primary-foreground/10 pb-12 z-10">
        <div>
          <p className="font-mono text-sm uppercase tracking-widest mb-4">Ready to Deploy?</p>
          <div className="flex flex-col gap-2">
            <Link href="#" className="text-4xl font-bold hover:translate-x-2 transition-transform">Documentation ↗</Link>
            <Link href="#" className="text-4xl font-bold hover:translate-x-2 transition-transform">GitHub Repo ↗</Link>
          </div>
        </div>
        <div className="mt-12 md:mt-0 text-right">
          <p className="font-mono text-sm uppercase tracking-widest mb-4">Contact</p>
          <p className="text-2xl font-bold">hello@kiosk.dev</p>
        </div>
      </div>

      {/* The Big Text */}
      <div className="relative z-10 mt-auto">
        <h2 className="font-grotesk text-[24vw] leading-[0.75] font-bold tracking-tighter text-center md:text-left -ml-4 md:-ml-12">
          KIOSK.
        </h2>
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-center py-6 border-t border-primary-foreground/10 font-mono text-xs uppercase tracking-widest opacity-60 z-10">
        <span>© 2025 Kiosk Inc.</span>
        <span className="hidden md:block">Mumbai, India [IST]</span>
        <ScrollTriggerArrow />
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,currentColor,currentColor_1px,transparent_1px,transparent_10px)]"></div>
      </div>
    </footer>
  );
};
