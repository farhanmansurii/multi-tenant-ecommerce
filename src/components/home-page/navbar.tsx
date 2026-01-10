import Link from "next/link";
import React from "react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 px-8 py-8 flex justify-between items-center mix-blend-difference text-white">
      <Link href="/" className="font-grotesk font-bold text-2xl uppercase tracking-tighter">Kiosk.</Link>
      <div className="hidden md:flex gap-12 font-mono text-xs uppercase tracking-widest items-center">
        <Link href="#features" className="hover:text-[#D1F861] transition-colors">Platform</Link>
        <Link href="#stack" className="hover:text-[#D1F861] transition-colors">Engine</Link>
        <Link href="/sign-in" className="hover:text-[#D1F861] transition-colors">Sign In</Link>
        <Link href="/sign-in" className="px-4 py-2 rounded-full border border-white/30 hover:bg-white hover:text-black transition-colors font-mono text-xs uppercase tracking-widest">
          Get Started
        </Link>
      </div>
      <div className="md:hidden">
        <Link href="/sign-in" className="px-4 py-2 rounded-full border border-white/30 hover:bg-white hover:text-black transition-colors font-mono text-xs uppercase tracking-widest">
          Sign In
        </Link>
      </div>
    </nav>
  );
};
