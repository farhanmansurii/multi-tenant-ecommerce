"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import DotMatrix from "@/components/storefront-ui/DotMatrix/DotMatrix";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/* ────────────────────────────────────────────────────────
   Preloader (adapted from storefront – no useLenis/useThemeConfig)
   ──────────────────────────────────────────────────────── */

let isInitialLoad = true;

function LandingPreloader({ onComplete }: { onComplete: () => void }) {
  const [showPreloader, setShowPreloader] = useState(isInitialLoad);
  const [loaderAnimating, setLoaderAnimating] = useState(isInitialLoad);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  useEffect(() => {
    if (loaderAnimating) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [loaderAnimating]);

  useGSAP(
    () => {
      if (!showPreloader) return;

      document.fonts.ready.then(() => {
        const logoSplit = SplitText.create(".preloader-logo h1", {
          type: "chars",
          charsClass: "char",
          mask: "chars",
        });

        gsap.set(logoSplit.chars, { x: "110%" });
        gsap.set(".preloader-logo h1", { opacity: 1 });

        function animateProgress(duration = 4.75) {
          const tl = gsap.timeline();
          const counterSteps = 5;
          let currentProgress = 0;

          for (let i = 0; i < counterSteps; i++) {
            const finalStep = i === counterSteps - 1;
            const targetProgress = finalStep
              ? 1
              : Math.min(currentProgress + Math.random() * 0.3 + 0.1, 0.9);
            currentProgress = targetProgress;

            tl.to(".preloader-progress-bar", {
              scaleX: targetProgress,
              duration: duration / counterSteps,
              ease: "power2.out",
            });
          }

          return tl;
        }

        const isMobile = window.innerWidth < 1000;
        const maskScale = isMobile ? 25 : 15;

        const tl = gsap.timeline({
          delay: 0.5,
          onComplete: () => {
            setLoaderAnimating(false);
            onComplete();
            setTimeout(() => {
              setShowPreloader(false);
            }, 100);
          },
        });

        tl.to(logoSplit.chars, {
          x: "0%",
          stagger: 0.05,
          ease: "power4.out",
          duration: 1,
        })
          .add(animateProgress(), "<")
          .set(".preloader-progress", { backgroundColor: "#fff" })
          .to(
            logoSplit.chars,
            {
              x: "-110%",
              stagger: 0.05,
              duration: 1,
              ease: "power4.out",
            },
            "-=0.5",
          )
          .to(
            ".preloader-progress",
            {
              opacity: 0,
              duration: 0.5,
              ease: "power3.out",
            },
            "-=0.5",
          )
          .to(
            ".preloader-mask",
            {
              scale: maskScale,
              duration: 1.25,
              ease: "power3.out",
            },
            "<",
          );
      });
    },
    { scope: wrapperRef, dependencies: [showPreloader] },
  );

  if (!showPreloader) return null;

  return (
    <div className="preloader-wrapper" ref={wrapperRef}>
      <div className="preloader-progress">
        <div className="preloader-progress-bar"></div>
        <div className="preloader-logo">
          <h1>Kiosk</h1>
        </div>
      </div>
      <div className="preloader-mask"></div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Menu (adapted from storefront – no useStoreSlug/useThemeConfig)
   ──────────────────────────────────────────────────────── */

function LandingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const menuRef = useRef<HTMLElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const splitTextsRef = useRef<ReturnType<typeof SplitText.create>[]>([]);
  const mainLinkSplitsRef = useRef<ReturnType<typeof SplitText.create>[]>([]);
  const lastScrollY = useRef(0);

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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1000);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      if (menuRef.current && !isMenuVisible) {
        menuRef.current.classList.remove("hidden");
        setIsMenuVisible(true);
      }
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        if (isOpen) closeMenu();
        if (isMenuVisible && menuRef.current) {
          menuRef.current.classList.add("hidden");
          setIsMenuVisible(false);
        }
      } else if (currentScrollY < lastScrollY.current) {
        if (!isMenuVisible && menuRef.current) {
          menuRef.current.classList.remove("hidden");
          setIsMenuVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    const scrollListener = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
    };

    window.addEventListener("scroll", scrollListener);
    return () => window.removeEventListener("scroll", scrollListener);
  }, [isOpen, isMenuVisible, isMobile]);

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

/* ────────────────────────────────────────────────────────
   Scroll counter – counts up when scrolled into view
   ──────────────────────────────────────────────────────── */

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

/* ────────────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────────────── */

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

/* ────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────── */

export default function MarketingStorefrontLandingClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [preloaderDone, setPreloaderDone] = useState(!isInitialLoad);

  useGSAP(
    () => {
      if (!preloaderDone) return;

      /* 1 ── Hero headline: masked char reveal with SplitText ── */
      document.fonts.ready.then(() => {
        const heroLines = document.querySelectorAll(".lp-hero-line");
        heroLines.forEach((line, lineIdx) => {
          const split = SplitText.create(line, {
            type: "chars",
            charsClass: "lp-char",
            mask: "chars",
          });

          gsap.fromTo(
            split.chars,
            { yPercent: 110 },
            {
              yPercent: 0,
              duration: 1.2,
              ease: "expo.out",
              stagger: 0.03,
              delay: 0.15 + lineIdx * 0.18,
            },
          );
        });

        /* 2 ── Hero subtitle + CTAs fade-up ── */
        gsap.fromTo(
          ".lp-sub",
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            delay: 0.9,
          },
        );

        /* 3 ── Hero media – diagonal wipe ── */
        gsap.fromTo(
          ".lp-hero-media",
          { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
          {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 1.4,
            ease: "power4.inOut",
            delay: 0.7,
          },
        );

        /* Accent line under hero */
        gsap.fromTo(
          ".lp-hero-accent",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.6,
            ease: "power4.inOut",
            delay: 1.1,
          },
        );
      });

      /* 4 ── Capabilities section heading reveal ── */
      const capHead = document.querySelector(".lp-cap-heading");
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

      /* 5 ── Horizontal scroll strip (pinned) ── */
      const stripTrack = document.querySelector(".lp-strip-track") as HTMLElement | null;
      if (stripTrack) {
        const scrollAmount = stripTrack.scrollWidth - window.innerWidth;
        if (scrollAmount > 0) {
          gsap.to(".lp-strip-track", {
            x: -scrollAmount,
            ease: "none",
            scrollTrigger: {
              trigger: ".lp-strip",
              start: "top top",
              end: () => `+=${scrollAmount}`,
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            },
          });
        }
      }

      /* 6 ── Feature sections ── */
      document.querySelectorAll(".lp-feat").forEach((section) => {
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

      /* 7 ── Stats – scale + rotate reveal ── */
      document.querySelectorAll(".lp-stat").forEach((stat, i) => {
        gsap.fromTo(
          stat,
          { scale: 0.8, opacity: 0, rotate: i % 2 === 0 ? -4 : 4 },
          {
            scale: 1,
            opacity: 1,
            rotate: 0,
            duration: 0.9,
            ease: "back.out(1.4)",
            scrollTrigger: { trigger: stat, start: "top 85%" },
          },
        );
      });

      /* 8 ── CTA – line draw + heading rise ── */
      gsap.fromTo(
        ".lp-cta-accent",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.3,
          ease: "power4.inOut",
          scrollTrigger: { trigger: ".lp-cta-accent", start: "top 80%" },
        },
      );

      gsap.fromTo(
        ".lp-cta-content h2",
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: ".lp-cta-content h2", start: "top 85%" },
        },
      );
    },
    { scope: rootRef, dependencies: [preloaderDone] },
  );

  /* ── Render ── */

  return (
    <div ref={rootRef} className="lp-root">
      {/* ── PRELOADER ── */}
      <LandingPreloader onComplete={() => setPreloaderDone(true)} />

      {/* ── MENU ── */}
      <LandingMenu />

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-dot-matrix">
          <DotMatrix
            color="#c5f74f"
            delay={0}
            speed={0.01}
            dotSize={2}
            spacing={5}
            opacity={0.35}
          />
        </div>

        <div className="lp-hero-watermark" aria-hidden="true">
          <h1>KIOSK</h1>
        </div>

        <div className="container lp-hero-container">
          <div className="lp-hero-copy">
            <div className="lp-hero-headline">
              <h1 className="lp-hero-line">MULTI-TENANT</h1>
              <h1 className="lp-hero-line">COMMERCE,</h1>
              <h1 className="lp-hero-line">BUILT DIFFERENT.</h1>
            </div>

            <div className="lp-hero-accent" style={{ transform: "scaleX(0)" }} />

            <div className="lp-sub" style={{ opacity: 0 }}>
              <div className="lp-hero-bottom">
                <p className="bodyCopy lg" style={{ maxWidth: "36rem", color: "var(--base-500)" }}>
                  Launch isolated storefronts with Postgres RLS, a merchant dashboard for analytics
                  and operations, and a premium customer experience out of the box.
                </p>
                <div className="lp-hero-ctas">
                  <Link href="/dashboard">
                    <button className="primary">Open dashboard</button>
                  </Link>
                  <Link href="/sign-in">
                    <button className="secondary">Sign in</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="lp-hero-media" style={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}>
            <div className="lp-placeholder lp-placeholder--hero">
              <span className="lp-placeholder-label">
                Hero image — Full-width screenshot of the merchant dashboard overview showing
                revenue charts, recent orders, and store metrics
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES – HORIZONTAL STRIP ── */}
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

      {/* ── FEATURES ── */}
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

      {/* ── STATS ── */}
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

      {/* ── CTA ── */}
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
            <Link href="/sign-in">
              <button className="lp-accent-btn">Get started free</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
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
