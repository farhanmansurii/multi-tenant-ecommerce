import { gsap } from "gsap";

export const gsapTransitions = {
  fast: { duration: 0.15, ease: "power2.out" },
  base: { duration: 0.3, ease: "power2.out" },
  slow: { duration: 0.5, ease: "power2.out" },
  spring: { duration: 0.4, ease: "back.out(1.7)" },
};

export function fadeIn(element: HTMLElement | null, delay = 0) {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0 },
    { opacity: 1, duration: 0.3, delay, ease: "power2.out" }
  );
}

export function fadeInUp(element: HTMLElement | null, delay = 0) {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.35, delay, ease: "power2.out" }
  );
}

export function slideIn(element: HTMLElement | null, direction: "left" | "right" = "left", delay = 0) {
  if (!element) return;
  const x = direction === "left" ? -20 : 20;
  gsap.fromTo(
    element,
    { opacity: 0, x },
    { opacity: 1, x: 0, duration: 0.3, delay, ease: "power2.out" }
  );
}

export function scaleIn(element: HTMLElement | null, delay = 0) {
  if (!element) return;
  gsap.fromTo(
    element,
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration: 0.3, delay, ease: "back.out(1.7)" }
  );
}

export function staggerChildren(
  container: HTMLElement | null,
  children: string,
  delay = 0.05
) {
  if (!container) return;
  gsap.fromTo(
    container.querySelectorAll(children),
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.3,
      stagger: delay,
      ease: "power2.out",
    }
  );
}

export function animateTabSwitch(
  oldContent: HTMLElement | null,
  newContent: HTMLElement | null,
  onComplete?: () => void
) {
  if (!oldContent || !newContent) return;

  const tl = gsap.timeline({
    onComplete,
  });

  tl.to(oldContent, {
    opacity: 0,
    x: -10,
    duration: 0.15,
    ease: "power2.in",
  })
    .set(oldContent, { display: "none" })
    .set(newContent, { display: "block", opacity: 0, x: 10 })
    .to(newContent, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out",
    });
}
