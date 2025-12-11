"use client";

import React from "react";
import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 pointer-events-auto shadow-2xl">
        <span className="font-bold text-white tracking-tight">KIOSK</span>
        <div className="h-4 w-[1px] bg-white/20" />
        <div className="flex gap-6 text-xs font-mono text-white/70">
          <Link href="#" className="hover:text-[#C5F74F] transition-colors">FEATURES</Link>
          <Link href="#" className="hover:text-[#C5F74F] transition-colors">STACK</Link>
          <Link href="#" className="hover:text-[#C5F74F] transition-colors">LOGIN</Link>
        </div>
      </div>
    </nav>
  );
};
