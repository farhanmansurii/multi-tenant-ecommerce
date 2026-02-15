"use client";
import "./copy.css";
import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger);

interface CopyProps {
  children: React.ReactElement<any>;
  animateOnScroll?: boolean;
  delay?: number;
  type?: "slide" | "flicker";
}

export default function Copy({
  children,
  animateOnScroll = true,
  delay = 0,
  type = "slide",
}: CopyProps) {
  const containerRef = useRef<any>(null);
  const splitRefs = useRef<any[]>([]);

  const waitForFonts = async () => {
    try {
      await document.fonts.ready;

      const customFonts = ["Koulen", "Host Grotesk", "DM Mono"];
      const fontCheckPromises = customFonts.map((fontFamily) => {
        return document.fonts.check(`16px ${fontFamily}`);
      });

      await Promise.all(fontCheckPromises);
      await new Promise((resolve) => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return true;
    }
  };

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const initializeSplitText = async () => {
        await waitForFonts();

        splitRefs.current = [];

        const element = containerRef.current;
        if (!element) return;

        if (type === "slide") {
          const split = SplitText.create(element, {
            type: "lines",
            mask: "lines",
            linesClass: "line",
            lineThreshold: 0.1,
          });

          splitRefs.current.push(split);

          const computedStyle = window.getComputedStyle(element);
          const textIndent = computedStyle.textIndent;

          if (textIndent && textIndent !== "0px") {
            if (split.lines.length > 0) {
              (split.lines[0] as HTMLElement).style.paddingLeft = textIndent;
            }
            element.style.textIndent = "0";
          }

          gsap.set(split.lines, { y: "100%" });

          const animation = gsap.to(split.lines, {
            y: "0%",
            duration: 1,
            stagger: 0.1,
            ease: "power4.out",
            delay: delay,
            paused: animateOnScroll,
          });

          if (animateOnScroll) {
            ScrollTrigger.create({
              trigger: containerRef.current,
              start: "top 80%",
              animation: animation,
              once: true,
              refreshPriority: -1,
            });
          }
        } else if (type === "flicker") {
          const split = SplitText.create(element, {
            type: "words,chars",
          });

          splitRefs.current.push(split);

          gsap.set(split.chars, { opacity: 0 });

          const animation = gsap.to(split.chars, {
            duration: 0.05,
            opacity: 1,
            ease: "power2.inOut",
            delay: delay,
            stagger: {
              amount: 0.5,
              each: 0.1,
              from: "random",
            },
            paused: animateOnScroll,
          });

          if (animateOnScroll) {
            ScrollTrigger.create({
              trigger: containerRef.current,
              start: "top 85%",
              animation: animation,
              once: true,
            });
          }
        }
      };

      initializeSplitText();

      return () => {
        splitRefs.current.forEach((split) => {
          if (split) {
            split.revert();
          }
        });
      };
    },
    { scope: containerRef, dependencies: [animateOnScroll, delay, type] }
  );

  return React.cloneElement(children, { ref: containerRef } as any);
}
