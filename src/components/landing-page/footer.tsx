"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// --- 4. THE FOOTER (Preserved as requested) ---
export const Footer = () => {
  return (
    <footer className="bg-background pt-24 pb-10 border-t border-border">
      <div className="container mx-auto px-6 flex flex-col items-center text-center">
        <div className="mb-12">
          <div className="grid grid-cols-2 gap-1 mx-auto w-12 h-12 mb-6">
            <div className="bg-foreground rounded-sm" />
            <div className="bg-foreground rounded-sm" />
            <div className="bg-[#C5F74F] rounded-sm" />
            <div className="bg-foreground rounded-sm" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Start your journey.</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of merchants scaling on Kiosk. The infrastructure is ready.
          </p>
          <button className="h-14 px-8 rounded-full bg-foreground text-background font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
            Get Started <ArrowUpRight size={18} />
          </button>
        </div>

        <div className="w-full border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground font-mono">
          <p>© 2025 Kiosk Inc. Built with Next.js 16.</p>
          <div className="flex gap-6 mt-4 md:mt-0 uppercase tracking-wider">
            <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-foreground transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Discord</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
