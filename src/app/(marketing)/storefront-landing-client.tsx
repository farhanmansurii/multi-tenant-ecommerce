"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import DotMatrix from "@/components/storefront-ui/DotMatrix/DotMatrix";
import Preloader, { isInitialLoad } from "@/components/marketing/preloader";
import Copy from "@/components/marketing/copy";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/* ════════════════════════════════════════════════════════════
   MAGNETIC BUTTON – cursor-reactive CTA
   ════════════════════════════════════════════════════════════ */

function MagneticButton({
  children,
  className = "",
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const inner = innerRef.current;
    if (!btn || !inner) return;

    const xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const innerXTo = gsap.quickTo(inner, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const innerYTo = gsap.quickTo(inner, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });

    const handleMove = (e: MouseEvent) => {
      const { left, top, width, height } = btn.getBoundingClientRect();
      const cx = left + width / 2;
      const cy = top + height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      xTo(dx * 0.35);
      yTo(dy * 0.35);
      innerXTo(dx * 0.15);
      innerYTo(dy * 0.15);
    };

    const handleLeave = () => {
      xTo(0);
      yTo(0);
      innerXTo(0);
      innerYTo(0);
    };

    btn.addEventListener("mousemove", handleMove);
    btn.addEventListener("mouseleave", handleLeave);
    return () => {
      btn.removeEventListener("mousemove", handleMove);
      btn.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <Link href={href} ref={btnRef} className={`lp-magnetic-btn ${className}`}>
      <span ref={innerRef} className="lp-magnetic-btn-inner">
        {children}
      </span>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════
   MENU – industrial nav with scramble text + scroll hide
   ════════════════════════════════════════════════════════════ */

function LandingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const splitTextsRef = useRef<ReturnType<typeof SplitText.create>[]>([]);
  const mainLinkSplitsRef = useRef<ReturnType<typeof SplitText.create>[]>([]);

  const scrambleText = (elements: Element[], duration = 0.4) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

    elements.forEach((char) => {
      const originalText = char.textContent;
      let iterations = 0;
      const maxIterations = Math.floor(Math.random() * 6) + 3;

      gsap.set(char, { opacity: 1 });

      const scrambleInterval = setInterval(() => {
        char.textContent = chars[Math.floor(Math.random() * chars.length)];
        iterations++;

        if (iterations >= maxIterations) {
          clearInterval(scrambleInterval);
          char.textContent = originalText;
        }
      }, 25);

      setTimeout(() => {
        clearInterval(scrambleInterval);
        char.textContent = originalText;
      }, duration * 1000);
    });
  };

  const openMenu = () => {
    setIsOpen(true);
    setIsAnimating(true);

    if (hamburgerRef.current) {
      hamburgerRef.current.classList.add("open");
    }

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    tl.to(menuOverlayRef.current, {
      duration: 0.75,
      scaleY: 1,
      ease: "power4.out",
    });

    const allWords = mainLinkSplitsRef.current.reduce(
      (acc: Element[], split) => acc.concat(split.words),
      [],
    );

    tl.to(
      allWords,
      {
        duration: 0.75,
        yPercent: 0,
        stagger: 0.1,
        ease: "power4.out",
      },
      "-=0.5",
    );

    const subCols = menuOverlayRef.current?.querySelectorAll(".menu-overlay-sub-col") ?? [];
    subCols.forEach((col) => {
      const links = col.querySelectorAll(".menu-sub-links a");
      tl.to(
        links,
        {
          duration: 0.75,
          y: 0,
          opacity: 1,
          stagger: 0.05,
          ease: "power4.out",
        },
        "<",
      );
    });

    tl.add(() => {
      splitTextsRef.current.forEach((split) => {
        split.chars.forEach((char: Element, index: number) => {
          setTimeout(() => {
            scrambleText([char], 0.4);
          }, index * 30);
        });
      });
    }, "<");
  };

  const closeMenu = () => {
    setIsOpen(false);
    setIsAnimating(true);

    if (hamburgerRef.current) {
      hamburgerRef.current.classList.remove("open");
    }

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    tl.add(() => {
      const allChars = splitTextsRef.current.reduce(
        (acc: Element[], split) => acc.concat(split.chars),
        [],
      );
      gsap.to(allChars, { opacity: 0, duration: 0.2 });
    });

    const subCols = menuOverlayRef.current?.querySelectorAll(".menu-overlay-sub-col") ?? [];
    subCols.forEach((col) => {
      const links = col.querySelectorAll(".menu-sub-links a");
      tl.to(
        links,
        {
          duration: 0.3,
          y: 50,
          opacity: 0,
          stagger: -0.05,
          ease: "power3.in",
        },
        "<",
      );
    });

    const allWords = mainLinkSplitsRef.current.reduce(
      (acc: Element[], split) => acc.concat(split.words),
      [],
    );

    tl.to(
      allWords,
      {
        duration: 0.3,
        yPercent: 120,
        stagger: -0.05,
        ease: "power3.in",
      },
      "<",
    );

    tl.to(
      menuOverlayRef.current,
      {
        duration: 0.5,
        scaleY: 0,
        ease: "power3.inOut",
      },
      "-=0.1",
    );
  };

  const toggleMenu = () => {
    if (isAnimating) return;
    if (isOpen) closeMenu();
    else openMenu();
  };

  const handleLinkClick = () => {
    if (isOpen) {
      setTimeout(() => closeMenu(), 500);
    }
  };

  useEffect(() => {
    if (!menuOverlayRef.current) return;

    gsap.set(menuOverlayRef.current, {
      scaleY: 0,
      transformOrigin: "top center",
    });

    const scrambleElements = menuOverlayRef.current.querySelectorAll(
      ".menu-items-header p, .menu-social a",
    );

    splitTextsRef.current = [];
    scrambleElements.forEach((element) => {
      const split = SplitText.create(element, { type: "chars" });
      splitTextsRef.current.push(split);
      gsap.set(split.chars, { opacity: 0 });
    });

    const mainLinks = menuOverlayRef.current.querySelectorAll(".menu-main-link h4");
    mainLinkSplitsRef.current = [];
    mainLinks.forEach((element) => {
      const split = SplitText.create(element, {
        type: "words",
        mask: "words",
      });
      mainLinkSplitsRef.current.push(split);
      gsap.set(split.words, { yPercent: 120 });
    });

    const subLinks = menuOverlayRef.current.querySelectorAll(".menu-sub-links a");
    gsap.set(subLinks, { y: 50, opacity: 0 });
  }, []);


  return (
    <nav className="menu" ref={menuRef}>
      <div className="menu-header" onClick={toggleMenu}>
        <h4 className="menu-logo">Kiosk</h4>
        <button className="menu-toggle" aria-label="Toggle menu">
          <div className="menu-hamburger-icon" ref={hamburgerRef}>
            <span className="menu-item"></span>
            <span className="menu-item"></span>
          </div>
        </button>
      </div>

      <div className="menu-overlay" ref={menuOverlayRef}>
        <div className="menu-overlay-items">
          <div className="menu-overlay-col menu-overlay-col-sm">
            <div className="menu-items-header">
              <p>Navigation</p>
            </div>
            <div className="menu-main-links">
              <Link href="/" className="menu-main-link" onClick={handleLinkClick}>
                <h4>Home</h4>
              </Link>
              <Link href="/dashboard" className="menu-main-link" onClick={handleLinkClick}>
                <h4>Dashboard</h4>
              </Link>
              <Link href="/sign-in" className="menu-main-link" onClick={handleLinkClick}>
                <h4>Get Started</h4>
              </Link>
            </div>
          </div>
          <div className="menu-overlay-col menu-overlay-col-lg">
            <div className="menu-overlay-sub-col">
              <div className="menu-items-header">
                <p>Platform</p>
              </div>
              <div className="menu-sub-links">
                <a href="#capabilities" onClick={handleLinkClick}>
                  Capabilities
                </a>
                <a href="#features" onClick={handleLinkClick}>
                  Features
                </a>
                <a href="#numbers" onClick={handleLinkClick}>
                  Numbers
                </a>
              </div>
            </div>
            <div className="menu-overlay-sub-col">
              <div className="menu-items-header">
                <p>Resources</p>
              </div>
              <div className="menu-sub-links menu-product-links">
                <Link href="/dashboard" onClick={handleLinkClick}>
                  Merchant Dashboard
                </Link>
                <Link href="/sign-in" onClick={handleLinkClick}>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="menu-overlay-footer">
          <div className="menu-social">
            <a href="#features" onClick={handleLinkClick}>
              Features
            </a>
          </div>
          <div className="menu-social">
            <a href="#numbers" onClick={handleLinkClick}>
              Numbers
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ════════════════════════════════════════════════════════════
   SCROLL COUNTER – counts up when scrolled into view
   ════════════════════════════════════════════════════════════ */

function ScrollCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(obj.val) + suffix;
            },
          });
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */

const STRIP_ITEMS = [
  {
    title: "ROW LEVEL SECURITY",
    desc: "Database-enforced tenant boundaries on every query",
  },
  {
    title: "ANALYTICS",
    desc: "Revenue, conversions, and growth metrics in real time",
  },
  {
    title: "STOREFRONT",
    desc: "Cart, checkout, wishlists, and customer accounts",
  },
  {
    title: "DISCOUNTS",
    desc: "Codes, percentage off, fixed amount, usage limits",
  },
  {
    title: "ORDERS",
    desc: "Full lifecycle tracking from pending to delivered",
  },
  {
    title: "CUSTOMERS",
    desc: "Profiles, purchase history, and segmentation",
  },
  {
    title: "PAYMENTS",
    desc: "Stripe, PayPal, UPI, COD, and bank transfer",
  },
  {
    title: "INVENTORY",
    desc: "Real-time stock tracking with variant support",
  },
];

const FEATURES = [
  {
    num: "01",
    title: "TENANT ISOLATION",
    body: "Row Level Security at the database layer. Every query scoped to the active store. Every table protected. Zero data leakage between tenants.",
    placeholder: "Screenshot of Postgres RLS policy configuration or database security diagram",
  },
  {
    num: "02",
    title: "MERCHANT DASHBOARD",
    body: "Revenue analytics, order management, customer profiles, discount engine, and inventory tracking. Everything a merchant needs in one interface.",
    placeholder:
      "Screenshot of the merchant dashboard showing analytics overview with charts and metrics",
  },
  {
    num: "03",
    title: "STOREFRONT ENGINE",
    body: "A premium customer-facing shopping experience with cart management, multi-step checkout, wishlists, saved addresses, and account management.",
    placeholder: "Screenshot of a live storefront product page with cart and checkout flow",
  },
];

const STATS = [
  { value: 100, suffix: "%", label: "TENANT ISOLATED" },
  { value: 6, suffix: "+", label: "PAYMENT GATEWAYS" },
  { value: 12, suffix: "+", label: "API ENDPOINTS" },
  { value: 0, suffix: "", label: "VENDOR LOCK-IN", display: "ZERO" },
];

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */

export default function MarketingStorefrontLandingClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [preloaderDone, setPreloaderDone] = useState(!isInitialLoad);
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroHeadlineRef = useRef<HTMLDivElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const heroRightRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Main GSAP animation orchestration
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !preloaderDone) return;

      const baseDelay = isInitialLoad ? 5.5 : 0.3;

      const ctx = gsap.context(() => {
        /* ─── HERO ENTRANCE TIMELINE ─── */
        const heroTl = gsap.timeline({ delay: baseDelay });

        // Hero headline – dramatic reveal
        if (heroHeadlineRef.current) {
          const headlineLines = heroHeadlineRef.current.querySelectorAll(".lp-hero-line");
          gsap.set(headlineLines, { y: "110%", opacity: 0 });

          heroTl.to(headlineLines, {
            y: "0%",
            opacity: 1,
            duration: 1.4,
            stagger: 0.12,
            ease: "expo.out",
          });
        }

        // Hero right panel – stagger cards in
        if (heroRightRef.current) {
          const cards = heroRightRef.current.querySelectorAll(".lp-hero-stat-card");
          gsap.set(cards, { x: 60, opacity: 0 });

          heroTl.to(
            cards,
            {
              x: 0,
              opacity: 1,
              duration: 1,
              stagger: 0.15,
              ease: "expo.out",
            },
            "-=0.8",
          );
        }

        // Hero visual – perspective rise
        if (heroVisualRef.current) {
          gsap.set(heroVisualRef.current, {
            y: 200,
            opacity: 0,
            rotateX: 8,
          });

          heroTl.to(
            heroVisualRef.current,
            {
              y: 0,
              opacity: 1,
              rotateX: 0,
              duration: 1.4,
              ease: "expo.out",
            },
            "-=0.6",
          );
        }

        /* ─── HERO SCROLL PARALLAX ─── */
        if (heroHeadlineRef.current && heroSectionRef.current) {
          gsap.to(heroHeadlineRef.current, {
            y: 200,
            ease: "none",
            scrollTrigger: {
              trigger: heroSectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }

        // Visual parallax – moves slower for depth
        if (heroVisualRef.current && heroSectionRef.current) {
          gsap.to(heroVisualRef.current, {
            y: -80,
            ease: "none",
            scrollTrigger: {
              trigger: heroSectionRef.current,
              start: "60% center",
              end: "bottom top",
              scrub: true,
            },
          });
        }

        /* ─── CAPABILITIES STRIP ─── */
        const capHead = root.querySelector(".lp-cap-heading");
        if (capHead) {
          gsap.fromTo(
            capHead,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: capHead, start: "top 85%" },
            },
          );
        }

        const stripTrack = root.querySelector(".lp-strip-track");
        const stripSection = root.querySelector(".lp-strip");
        if (stripTrack && stripSection) {
          const scrollAmount = stripTrack.scrollWidth - window.innerWidth;
          if (scrollAmount > 0) {
            gsap.to(stripTrack, {
              x: -scrollAmount,
              ease: "none",
              scrollTrigger: {
                trigger: stripSection,
                start: "top top",
                end: () => `+=${scrollAmount}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
              },
            });
          }
        }

        /* ─── FEATURE SECTIONS ─── */
        root.querySelectorAll(".lp-feat").forEach((section) => {
          const bgNum = section.querySelector(".lp-feat-bg");
          const media = section.querySelector(".lp-feat-media");
          const textChildren = section.querySelector(".lp-feat-copy")?.children;

          if (bgNum) {
            gsap.fromTo(
              bgNum,
              { scale: 0.6, opacity: 0 },
              {
                scale: 1,
                opacity: 0.04,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: { trigger: section, start: "top 75%" },
              },
            );
          }

          if (media) {
            gsap.fromTo(
              media,
              { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
              {
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                duration: 1.2,
                ease: "power3.inOut",
                scrollTrigger: { trigger: section, start: "top 65%" },
              },
            );
          }

          if (textChildren) {
            gsap.fromTo(
              textChildren,
              { y: 40, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.12,
                scrollTrigger: { trigger: section, start: "top 65%" },
              },
            );
          }
        });

        /* ─── STATS ─── */
        root.querySelectorAll(".lp-stat").forEach((stat, i) => {
          gsap.fromTo(
            stat,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "expo.out",
              delay: i * 0.1,
              scrollTrigger: { trigger: stat, start: "top 85%" },
            },
          );
        });

        /* ─── CTA ─── */
        const ctaAccent = root.querySelector(".lp-cta-accent");
        if (ctaAccent) {
          gsap.fromTo(
            ctaAccent,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 1.3,
              ease: "power4.inOut",
              scrollTrigger: { trigger: ctaAccent, start: "top 80%" },
            },
          );
        }

        const ctaHeading = root.querySelector(".lp-cta-content h2");
        if (ctaHeading) {
          gsap.fromTo(
            ctaHeading,
            { y: 80, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.1,
              ease: "expo.out",
              scrollTrigger: { trigger: ctaHeading, start: "top 85%" },
            },
          );
        }

        /* ─── NAVBAR THEME PER SECTION ─── */
        const menu = root.querySelector(".menu") as HTMLElement | null;
        if (menu) {
          // Dark sections: strip, stats → navbar gets "menu--light" class
          const darkSections = root.querySelectorAll(".lp-strip, .lp-stats");
          darkSections.forEach((section) => {
            ScrollTrigger.create({
              trigger: section,
              start: "top top+=60",
              end: "bottom top+=60",
              onEnter: () => menu.classList.add("menu--light"),
              onLeave: () => menu.classList.remove("menu--light"),
              onEnterBack: () => menu.classList.add("menu--light"),
              onLeaveBack: () => menu.classList.remove("menu--light"),
            });
          });
        }
      }, root);

      return () => ctx.revert();
    },
    { scope: rootRef, dependencies: [preloaderDone] },
  );

  return (
    <div ref={rootRef} className="lp-root">
      {/* Noise grain overlay */}
      <div className="lp-grain" aria-hidden="true" />

      {/* ── PRELOADER ── */}
      <Preloader onAnimationComplete={() => setPreloaderDone(true)} />

      {/* ── MENU ── */}
      <LandingMenu />

      {/* ═══════════════════════════════════════════════
          HERO – AWWWARDS-LEVEL EDITORIAL
          ═══════════════════════════════════════════════ */}
      <section className="lp-hero" ref={heroSectionRef}>
        {/* Dot matrix background */}
        <div className="lp-hero-bg-matrix">
          <DotMatrix
            color="#969992"
            dotSize={2}
            spacing={5}
            opacity={0.9}
            delay={isInitialLoad ? 6 : 1.125}
          />
        </div>

        {/* Grid lines background */}
        <div className="lp-hero-gridlines" aria-hidden="true">
          <div className="lp-gridline lp-gridline--v" style={{ left: "25%" }} />
          <div className="lp-gridline lp-gridline--v" style={{ left: "50%" }} />
          <div className="lp-gridline lp-gridline--v" style={{ left: "75%" }} />
        </div>

        {/* Top bar – meta info */}
        <div className="lp-hero-topbar">
          <div className="lp-hero-topbar-inner">
            <Copy type="flicker" delay={isInitialLoad ? 5.2 : 0.2} animateOnScroll={false}>
              <span className="lp-hero-tag">Multi-Tenant Commerce Platform</span>
            </Copy>
            <Copy type="flicker" delay={isInitialLoad ? 5.4 : 0.3} animateOnScroll={false}>
              <span className="lp-hero-tag">
                <span className="lp-hero-pulse" />
                Production Ready
              </span>
            </Copy>
          </div>
        </div>

        {/* Main hero content grid */}
        <div className="lp-hero-content">
          <div className="lp-hero-main">
            {/* Massive headline */}
            <div className="lp-hero-headline" ref={heroHeadlineRef}>
              <div className="lp-hero-line-wrap">
                <div className="lp-hero-line">MULTI-TENANT</div>
              </div>
              <div className="lp-hero-line-wrap">
                <div className="lp-hero-line lp-hero-line--indent">COMMERCE</div>
              </div>
              <div className="lp-hero-line-wrap">
                <div className="lp-hero-line">
                  PLATFORM<span className="lp-hero-line-accent">.</span>
                </div>
              </div>
            </div>

            {/* Description + CTA row */}
            <div className="lp-hero-bottom">
              <div className="lp-hero-description">
                <div className="lp-hero-desc-rule" />
                <Copy animateOnScroll={false} delay={isInitialLoad ? 6.4 : 1.0}>
                  <p className="lp-hero-desc-text">
                    Database-enforced tenant isolation with Postgres RLS. Merchant analytics.
                    Premium storefronts. Ship your platform today.
                  </p>
                </Copy>
              </div>
              <div className="lp-hero-cta-group">
                <MagneticButton href="/sign-in" className="lp-hero-cta-primary">
                  <span className="lp-hero-cta-label">Get Started</span>
                  <span className="lp-hero-cta-arrow">&#8599;</span>
                </MagneticButton>
                <MagneticButton href="/dashboard" className="lp-hero-cta-secondary">
                  <span className="lp-hero-cta-label">View Dashboard</span>
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* Right rail – stat cards */}
          <div className="lp-hero-rail" ref={heroRightRef}>
            <div className="lp-hero-stat-card">
              <span className="lp-hero-stat-label">TENANT ISOLATION</span>
              <span className="lp-hero-stat-value">100%</span>
              <span className="lp-hero-stat-sub">Postgres RLS enforced</span>
            </div>
            <div className="lp-hero-stat-card">
              <span className="lp-hero-stat-label">READY TO SHIP</span>
              <span className="lp-hero-stat-value">NOW</span>
              <span className="lp-hero-stat-sub">Full-stack platform</span>
            </div>
            <div className="lp-hero-stat-card lp-hero-stat-card--dark">
              <span className="lp-hero-stat-label">STATUS</span>
              <span className="lp-hero-stat-value lp-hero-stat-live">
                <span className="lp-hero-pulse" />
                LIVE
              </span>
              <span className="lp-hero-stat-sub">Production deployment</span>
            </div>
          </div>
        </div>

        {/* Hero visual – dashboard preview */}
        <div className="lp-hero-visual" ref={heroVisualRef} style={{ perspective: "1200px" }}>
          <div className="lp-hero-visual-inner">
            <div className="lp-placeholder lp-placeholder--hero">
              <span className="lp-placeholder-label">
                Dashboard Preview — Analytics, Orders, Revenue Metrics
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CAPABILITIES – HORIZONTAL STRIP
          ═══════════════════════════════════════════════ */}
      <section className="lp-strip" id="capabilities">
        <div className="lp-cap-heading">
          <p className="md" style={{ color: "var(--storefront-accent, #c5f74f)" }}>
            WHAT&apos;S INSIDE
          </p>
          <h3 style={{ marginTop: "0.75rem", color: "var(--base-100)" }}>
            PLATFORM
            <br />
            CAPABILITIES
          </h3>
        </div>
        <div className="lp-strip-track">
          {STRIP_ITEMS.map((item, i) => (
            <div key={item.title} className="lp-strip-card">
              <span className="lp-strip-idx">{String(i + 1).padStart(2, "0")}</span>
              <div className="lp-strip-body">
                <h4>{item.title}</h4>
                <p className="bodyCopy" style={{ marginTop: "0.75rem", color: "var(--base-400)" }}>
                  {item.desc}
                </p>
              </div>
              <div className="lp-strip-bar" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES
          ═══════════════════════════════════════════════ */}
      <div id="features">
        {FEATURES.map((feat, i) => (
          <section key={feat.num} className={`lp-feat ${i % 2 !== 0 ? "lp-feat--flip" : ""}`}>
            <div className="container">
              <span className="lp-feat-bg" aria-hidden="true">
                {feat.num}
              </span>
              <div className="lp-feat-grid">
                <div className="lp-feat-media">
                  <div className="lp-placeholder lp-placeholder--feature">
                    <span className="lp-placeholder-label">{feat.placeholder}</span>
                  </div>
                </div>
                <div className="lp-feat-copy">
                  <p className="md" style={{ color: "var(--storefront-accent, #c5f74f)" }}>
                    {feat.num}
                  </p>
                  <h3 style={{ marginTop: "0.75rem" }}>{feat.title}</h3>
                  <p
                    className="bodyCopy lg"
                    style={{
                      marginTop: "1.5rem",
                      color: "var(--base-400)",
                    }}
                  >
                    {feat.body}
                  </p>
                  <div style={{ marginTop: "2rem" }}>
                    <Link href="/dashboard">
                      <button className="primary">Explore</button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════
          STATS
          ═══════════════════════════════════════════════ */}
      <section className="lp-stats" id="numbers">
        <div className="lp-stats-dot-matrix">
          <DotMatrix
            color="#c5f74f"
            delay={0.5}
            speed={0.008}
            dotSize={2}
            spacing={6}
            opacity={0.15}
          />
        </div>
        <div className="container">
          <div className="lp-stats-head">
            <p className="md" style={{ color: "var(--storefront-accent, #c5f74f)" }}>
              BY THE NUMBERS
            </p>
            <h3 style={{ marginTop: "0.75rem" }}>
              WHAT SHIPS
              <br />
              OUT OF THE BOX
            </h3>
          </div>
          <div className="lp-stats-grid">
            {STATS.map((stat) => (
              <div key={stat.label} className="lp-stat">
                <h2>
                  {stat.display ? (
                    stat.display
                  ) : (
                    <ScrollCounter target={stat.value} suffix={stat.suffix} />
                  )}
                </h2>
                <p className="md" style={{ marginTop: "1rem" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════════ */}
      <section className="lp-cta">
        <div className="container lp-cta-content">
          <div className="lp-cta-accent" />
          <h2>START BUILDING</h2>
          <p
            className="bodyCopy lg"
            style={{
              marginTop: "1.75rem",
              maxWidth: "34rem",
              color: "var(--base-400)",
            }}
          >
            Spin up a store, configure your catalog, and go live. Tenant isolation is handled for
            you at the database layer.
          </p>
          <div style={{ marginTop: "2.5rem" }}>
            <MagneticButton href="/sign-in" className="lp-accent-btn-wrap">
              Get started free
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════ */}
      <div className="lp-footer">
        <div className="container">
          <div className="lp-footer-main">
            <div className="lp-footer-brand">
              <h5>KIOSK</h5>
              <p className="bodyCopy" style={{ marginTop: "0.5rem", color: "var(--base-400)" }}>
                Multi-tenant commerce.
                <br />
                Tenant isolation by design.
              </p>
            </div>
            <div className="lp-footer-cols">
              <div className="lp-footer-col">
                <p style={{ color: "var(--storefront-accent, #c5f74f)", marginBottom: "1rem" }}>
                  PRODUCT
                </p>
                <Link href="/dashboard">Dashboard</Link>
                <a href="#capabilities">Capabilities</a>
                <a href="#features">Features</a>
                <a href="#numbers">Numbers</a>
              </div>
              <div className="lp-footer-col">
                <p style={{ color: "var(--storefront-accent, #c5f74f)", marginBottom: "1rem" }}>
                  ACCOUNT
                </p>
                <Link href="/sign-in">Sign in</Link>
                <Link href="/dashboard">Get started</Link>
              </div>
            </div>
          </div>
          <div className="lp-footer-end">
            <p style={{ color: "var(--base-500)" }}>&copy; {new Date().getFullYear()} Kiosk</p>
          </div>
        </div>
      </div>
    </div>
  );
}
