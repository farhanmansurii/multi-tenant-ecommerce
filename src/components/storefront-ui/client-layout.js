"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { ReactLenis } from "lenis/react";

export default function ClientLayout({ children, footer }) {
  const pageRef = useRef();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "1";

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const scrollSettings = isMobile
    ? {
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        smoothTouch: true,
        touchMultiplier: 1.5,
        infinite: false,
        lerp: 0.09,
        wheelMultiplier: 1,
        orientation: "vertical",
        smoothWheel: true,
        syncTouch: true,
      }
    : {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        lerp: 0.1,
        wheelMultiplier: 1,
        orientation: "vertical",
        smoothWheel: true,
        syncTouch: true,
      };

  // Smooth scrolling wraps the page in a transformed root, which makes anchored UI
  // (like Radix popovers) feel janky while scrolling in edit mode.
  if (isEditMode) {
    return (
      <div className="page" ref={pageRef}>
        {children}
        {pathname !== "/lookbook" && footer}
      </div>
    );
  }

  return (
    <ReactLenis root options={scrollSettings}>
      <div className="page" ref={pageRef}>
        {children}
        {pathname !== "/lookbook" && footer}
      </div>
    </ReactLenis>
  );
}
