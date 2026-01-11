"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const wrap = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (wrap.current) wrap.current.style.display = "none";
        onComplete();
      }
    });

    // Animate counter
    tl.to(".loader-num", {
      innerText: 100,
      duration: 1.5,
      snap: { innerText: 1 },
      ease: "power2.in"
    })
    // Slide up the loader
    .to(".loader-inner", {
      yPercent: -100,
      duration: 0.8,
      ease: "power3.inOut"
    })
    .to(".loader-bg", {
      yPercent: -100,
      duration: 0.8,
      ease: "power3.inOut"
    }, "-=0.6")
    // Reveal hero elements
    .from(".h-reveal", {
      yPercent: 100,
      duration: 1.2,
      stagger: 0.08,
      ease: "power4.out"
    }, "-=0.4");
  });

  return (
    <div ref={wrap} className="fixed inset-0 z-[999]">
      <div className="loader-bg absolute inset-0 bg-neutral-950" />
      <div className="loader-inner absolute inset-0 bg-neutral-950 flex items-end p-8">
        <div className="flex items-baseline gap-1">
          <span className="loader-num font-mono text-7xl md:text-9xl text-white font-light">0</span>
          <span className="font-mono text-xl md:text-2xl text-white/50">%</span>
        </div>
      </div>
    </div>
  );
};
