"use client";
import { useRef, useEffect } from "react";

import gsap from "gsap";
import { usePathname } from "next/navigation";

const BLOCK_COUNT = 10;

export default function TransitionProvider({ children }) {
  const transitionGridRef = useRef(null);
  const blocksRef = useRef([]);
  const pathname = usePathname();

  const createTransitionGrid = () => {
    if (!transitionGridRef.current) return;

    const container = transitionGridRef.current;
    container.innerHTML = "";
    blocksRef.current = [];

    const blockWidth = window.innerWidth / BLOCK_COUNT;

    for (let i = 0; i < BLOCK_COUNT; i++) {
      const block = document.createElement("div");
      block.className = "transition-block";
      block.style.cssText = `
        width: ${blockWidth + 5}px;
        height: 100%;
        left: ${i * blockWidth}px;
        margin-left: -2.5px;
      `;
      container.appendChild(block);
      blocksRef.current.push(block);
    }

    gsap.set(blocksRef.current, { scaleX: 0 });
  };

  useEffect(() => {
    createTransitionGrid();
    window.addEventListener("resize", createTransitionGrid);
    return () => window.removeEventListener("resize", createTransitionGrid);
  }, []);

  useEffect(() => {
    // Minimal "enter" transition on route changes without depending on
    // `next-transition-router` (which requires an extra install).
    if (!blocksRef.current.length) return;
    gsap.set(blocksRef.current, { scaleX: 1, transformOrigin: "right" });
    gsap.to(blocksRef.current, {
      scaleX: 0,
      duration: 0.5,
      ease: "power3.out",
      stagger: { amount: 0.3, from: "start" },
    });
  }, [pathname]);

  return (
    <>
      <div ref={transitionGridRef} className="transition-grid" />
      {children}
    </>
  );
}
