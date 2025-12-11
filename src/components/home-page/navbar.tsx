import Link from "next/link";
import React from "react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 px-8 py-8 flex justify-between items-center mix-blend-difference text-white">
      <Link href="/" className="font-grotesk font-bold text-2xl uppercase tracking-tighter">Kiosk.</Link>
      <div className="hidden md:flex gap-12 font-mono text-xs uppercase tracking-widest">
        <Link href="#features" className="hover:text-[#D1F861] transition-colors">Platform</Link>
        <Link href="#stack" className="hover:text-[#D1F861] transition-colors">Engine</Link>
      </div>
      <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
        <div className="w-4 h-[1px] bg-current"></div>
      </button>
    </nav>
  );
};
