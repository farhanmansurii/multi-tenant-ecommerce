"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";

import Preloader from "@/components/storefront-ui/Preloader/Preloader";
import DotMatrix from "@/components/storefront-ui/DotMatrix/DotMatrix";
import MarqueeBanner from "@/components/storefront-ui/MarqueeBanner/MarqueeBanner";
import TextBlock from "@/components/storefront-ui/TextBlock/TextBlock";
import PeelReveal from "@/components/storefront-ui/PeelReveal/PeelReveal";
import ZoomSection from "@/components/storefront-ui/ZoomSection/ZoomSection";
import Copy from "@/components/storefront-ui/Copy/Copy";
import BrandIcon from "@/components/storefront-ui/BrandIcon/BrandIcon";

import { ThemeConfigProvider } from "@/components/storefront-ui/storefront/ThemeConfigProvider";
import type { StorefrontThemeConfig } from "@/components/storefront-ui/storefront/theme-config";
import { defaultStorefrontContent } from "@/components/storefront-ui/storefront/storefront-content";
import { StorefrontEditProvider } from "@/components/storefront-ui/edit/StorefrontEditProvider";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const MARKETING_SLUG = "__marketing";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function marketingTheme(): StorefrontThemeConfig {
  // Use the existing storefront-ui theme system, but swap in platform copy.
  // Keep the same media paths so the “storefront-ui” look stays consistent.
  return {
    name: "Kiosk",
    slug: MARKETING_SLUG,
    logoUrl: null,
    currency: "USD",
    accentColor: "#C5F74F",
    shippingEnabled: false,
    freeShippingThreshold: null,
    paymentMethods: ["stripe", "cod"],
    codEnabled: false,
    contactEmail: "support@kiosk.app",
    termsOfService: "",
    privacyPolicy: "",
    refundPolicy: "",
    content: {
      ...defaultStorefrontContent,
      hero: {
        ...defaultStorefrontContent.hero,
        headline: "Kiosk is multi-tenant commerce with isolation by default.",
        footerLeftLabel: "RLS Tenant Boundary",
        footerRightLabel: "Draft to Publish",
      },
      about: {
        ...defaultStorefrontContent.about,
        eyebrow: "Commerce infrastructure with a storefront and a dashboard.",
        headline:
          "Run many stores with confidence. Tenant context is set server-side and enforced at the database layer with Postgres RLS.",
        footerLabel: "/ Platform Core /",
      },
      featured: {
        ...defaultStorefrontContent.featured,
        eyebrow: "Shipping today",
        headlineTop: "Storefront",
        headlineBottom: "And Ops",
        leftLabel: "Multi-tenant primitives",
        rightCtaLabel: "Open Dashboard",
      },
      zoomSection: {
        ...defaultStorefrontContent.zoomSection,
        enabled: true,
        imageSource: "static",
        eyebrow: "Draft workflow",
        headline: "Preview changes. Publish when ready.",
        body: "Edit your storefront as a draft, see updates instantly, and publish to your live store when it is ready.",
      },
      marquee: {
        ...defaultStorefrontContent.marquee,
        badge: "[ Multi-Tenant ]",
        headline: "RLS-backed isolation across stores",
        line1: "TENANT CONTEXT SET SERVER-SIDE",
        line2: "ANALYTICS, DISCOUNTS, CUSTOMERS, CHECKOUT",
      },
      textBlock: {
        ...defaultStorefrontContent.textBlock,
        headline: "Isolation is not a feature. It is a baseline.",
        paragraphs: [
          "Every tenant-scoped table can be protected by Row Level Security, keyed off a server-set store context. Your app stays simpler because enforcement lives in the database.",
          "Ship a premium storefront, then operate with analytics, orders, customers, and discounts. Draft changes, preview them, and publish when you are ready.",
        ],
      },
      peelReveal: {
        ...defaultStorefrontContent.peelReveal,
        headerLeft: "Signal type: Tenant",
        footerStatus: "Status: Isolated",
        headline: "Data boundaries that do not leak",
        introLeft: "RLS",
        introRight: "Context",
      },
      cta: {
        ...defaultStorefrontContent.cta,
        sideCopy:
          "Start with a storefront UI that feels intentional, then scale your operations with the merchant dashboard.",
        headline: "Deploy a storefront. Operate a platform.",
        buttonLabel: "Sign in",
      },
      pdp: {
        ...defaultStorefrontContent.pdp,
        addToBagLabel: "Add",
        saveItemLabel: "Save",
      },
    },
  };
}

export default function MarketingStorefrontLandingClient() {
  const theme = useMemo(() => marketingTheme(), []);
  const heroMediaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!heroMediaRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroMediaRef.current,
        { y: 120, opacity: 0.7 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.6 }
      );

      gsap.to(heroMediaRef.current, {
        y: -90,
        ease: "none",
        scrollTrigger: {
          trigger: heroMediaRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.utils.toArray<HTMLElement>(".mkt-card").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>(".mkt-slice-media img").forEach((img) => {
        gsap.to(img, {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: img,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <StorefrontEditProvider slug={MARKETING_SLUG} initialOverrides={{}}>
      <ThemeConfigProvider value={theme}>
        <Preloader />

        <div className="mkt-nav">
          <div className="mkt-nav-inner">
            <Copy type="flicker" animateOnScroll={false} delay={2.25}>
              <p className="md">Kiosk</p>
            </Copy>
            <div className="mkt-links">
              <Copy type="flicker" animateOnScroll={false} delay={2.3}>
                <a href="#stack">
                  <span className="md">Stack</span>
                </a>
              </Copy>
              <Copy type="flicker" animateOnScroll={false} delay={2.35}>
                <a href="#motion">
                  <span className="md">Motion</span>
                </a>
              </Copy>
              <Copy type="flicker" animateOnScroll={false} delay={2.4}>
                <Link href="/dashboard">
                  <span className="md">Dashboard</span>
                </Link>
              </Copy>
              <Copy type="flicker" animateOnScroll={false} delay={2.45}>
                <Link href="/sign-in">
                  <span className="md">Sign in</span>
                </Link>
              </Copy>
            </div>
          </div>
        </div>

        <section className="mkt-hero" id="top">
          <div className="mkt-hero-grid" aria-hidden="true">
            <DotMatrix color="#969992" dotSize={2} spacing={5} opacity={0.9} delay={2.6} />
          </div>

          <div className="container">
            <div className="mkt-hero-left">
              <div className="mkt-kicker">
                <span className="dot" />
                <Copy type="flicker" animateOnScroll={false} delay={2.65}>
                  <p className="md">Multi-tenant commerce, brutal by design</p>
                </Copy>
              </div>

              <Copy animateOnScroll={false} delay={2.2}>
                <h1>
                  ISOLATE <span className="mkt-accent">TENANTS</span>
                  <br />
                  SHIP STORES
                  <br />
                  OPERATE FAST
                </h1>
              </Copy>

              <div style={{ marginTop: "2.25rem", maxWidth: "52rem" }}>
                <Copy>
                  <p className="bodyCopy lg">
                    Kiosk is a multi-tenant commerce stack with a premium storefront UI and an
                    operations dashboard: analytics, orders, customers, and discounts. Isolation is
                    enforced at the database layer with Postgres RLS.
                  </p>
                </Copy>
              </div>

              <div style={{ marginTop: "2.25rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Copy type="flicker">
                  <Link href="/dashboard">
                    <button className="primary">Open dashboard</button>
                  </Link>
                </Copy>
                <Copy type="flicker">
                  <Link href="/sign-in">
                    <button className="secondary">Sign in</button>
                  </Link>
                </Copy>
                <Copy type="flicker">
                  <a href="#stack">
                    <button>See the stack</button>
                  </a>
                </Copy>
              </div>
            </div>

            <div className="mkt-hero-right">
              <div className="mkt-panel dark">
                <div className="row">
                  <Copy type="flicker">
                    <p className="md">TENANCY</p>
                  </Copy>
                  <Copy type="flicker">
                    <p className="md">ACTIVE</p>
                  </Copy>
                </div>
                <Copy>
                  <p className="bodyCopy md" style={{ marginTop: "0.9rem" }}>
                    Tenant context is resolved from subdomain or slug routing, then enforced via
                    RLS policies. No “best effort” filters.
                  </p>
                </Copy>
              </div>

              <div className="mkt-panel">
                <div className="row">
                  <Copy type="flicker">
                    <p className="md">WORKFLOW</p>
                  </Copy>
                  <Copy type="flicker">
                    <p className="md">DRAFT</p>
                  </Copy>
                </div>
                <Copy>
                  <p className="bodyCopy md" style={{ marginTop: "0.9rem" }}>
                    Draft, preview, publish. Iterate fast without breaking a live store.
                  </p>
                </Copy>
              </div>

              <div className="mkt-panel">
                <div className="row">
                  <Copy type="flicker">
                    <p className="md">OPS</p>
                  </Copy>
                  <Copy type="flicker">
                    <p className="md">LIVE</p>
                  </Copy>
                </div>
                <Copy>
                  <p className="bodyCopy md" style={{ marginTop: "0.9rem" }}>
                    Analytics, orders, customers, discounts, and inventory controls.
                  </p>
                </Copy>
              </div>
            </div>
          </div>

          <div className="hero-img" ref={heroMediaRef}>
            <img src={theme.content.hero.imageUrl} alt="" />
          </div>

          <div className="section-footer">
            <Copy type="flicker" delay={3.6} animateOnScroll={false}>
              <p>{theme.content.hero.footerLeftLabel}</p>
            </Copy>
            <Copy type="flicker" delay={3.6} animateOnScroll={false}>
              <p>{theme.content.hero.footerRightLabel}</p>
            </Copy>
          </div>
        </section>

        <section className="mkt-stack" id="stack">
          <div className="container">
            <div className="mkt-stack-left">
              <Copy type="flicker">
                <p className="md">STACK</p>
              </Copy>
              <Copy>
                <h3>
                  {theme.content.featured.headlineTop} <br /> {theme.content.featured.headlineBottom}
                </h3>
              </Copy>
              <div style={{ marginTop: "1.75rem" }}>
                <Copy>
                  <p className="bodyCopy md">
                    A platform workflow: isolate data at the DB layer, ship a storefront UI, then
                    run operations from the dashboard.
                  </p>
                </Copy>
              </div>
              <div style={{ marginTop: "1.75rem" }}>
                <Copy type="flicker">
                  <p>{theme.content.featured.leftLabel}</p>
                </Copy>
              </div>
            </div>

            <div className="mkt-stack-right">
              {[
                {
                  tag: "TENANCY",
                  title: "RLS-backed isolation",
                  body: "Every tenant-scoped table is protected by policies keyed off a server-set store context.",
                },
                {
                  tag: "PUBLISHING",
                  title: "Draft, preview, publish",
                  body: "Edit storefront content as a draft, preview changes live, and publish when ready.",
                },
                {
                  tag: "OPS",
                  title: "Analytics and tooling",
                  body: "Revenue, activity, orders, customers, and discounts. Tight feedback loops for commerce.",
                },
                {
                  tag: "ROUTING",
                  title: "Slug or subdomain",
                  body: "Tenant context can resolve from subdomain or /stores/{slug}, keeping tenancy flexible.",
                },
              ].map((x) => (
                <div key={x.title} className="mkt-card">
                  <Copy type="flicker">
                    <span className="tag">
                      <span className="dot" />
                      {x.tag}
                    </span>
                  </Copy>
                  <div style={{ marginTop: "1.25rem" }}>
                    <Copy>
                      <h4>{x.title}</h4>
                    </Copy>
                  </div>
                  <div style={{ marginTop: "0.9rem" }}>
                    <Copy>
                      <p className="bodyCopy md">{x.body}</p>
                    </Copy>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ZoomSection
          imageUrl={theme.content.zoomSection.imageUrl}
          eyebrow={theme.content.zoomSection.eyebrow}
          headline={theme.content.zoomSection.headline}
          body={theme.content.zoomSection.body}
        />

        <div id="motion">
          <MarqueeBanner />
        </div>

        <section className="mkt-slice">
          <div className="container">
            <div className="mkt-slice-copy">
              <Copy type="flicker">
                <p className="md">STORE UI</p>
              </Copy>
              <Copy>
                <h3>Brutal, kinetic, and editable.</h3>
              </Copy>
              <div style={{ marginTop: "1.25rem" }}>
                <Copy>
                  <p className="bodyCopy md">
                    Keep the storefront aesthetic consistent while you change the words, images,
                    and modules. Motion is intentional, not decorative.
                  </p>
                </Copy>
              </div>
              <div style={{ marginTop: "1.75rem" }}>
                <Copy type="flicker">
                  <a href="#start">
                    <button className="primary">Start</button>
                  </a>
                </Copy>
              </div>
            </div>
            <div className="mkt-slice-media">
              <img src="/storefront/lookbook/lookbook_img_02.jpg" alt="" />
            </div>
          </div>
        </section>

        <TextBlock />
        <PeelReveal />

        <section className="cta" id="start">
          <div className="container">
            <div className="cta-col">
              <Copy type="flicker">
                <p>{theme.content.cta.sideCopy}</p>
              </Copy>
              <div className="cta-side-img">
                <img src={theme.content.cta.sideImageLeftUrl} alt="" />
              </div>
            </div>

            <div className="cta-col">
              <div className="cta-header">
                <Copy type="flicker">
                  <p className="md">Start</p>
                </Copy>
                <Copy>
                  <h3>{theme.content.cta.headline}</h3>
                </Copy>
              </div>
              <div className="cta-main-img">
                <img src={theme.content.cta.mainImageUrl} alt="" />
              </div>
              <div className="btn">
                <Link href="/sign-in">
                  <span>{theme.content.cta.buttonLabel}</span>
                </Link>
              </div>
            </div>

            <div className="cta-col">
              <div className="cta-side-img">
                <img src={theme.content.cta.sideImageRightUrl} alt="" />
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div className="container">
            <div className="footer-row">
              <div className="footer-col">
                <div className="footer-col-header">
                  <Copy type="flicker">
                    <p>Kiosk</p>
                  </Copy>
                </div>
                <div className="footer-col-links">
                  <Copy type="flicker">
                    <Link href="/dashboard">Dashboard</Link>
                  </Copy>
                  <Copy type="flicker">
                    <Link href="/sign-in">Sign in</Link>
                  </Copy>
                </div>
              </div>

              <div className="footer-col">
                <div className="footer-col-header">
                  <Copy type="flicker">
                    <p>Product</p>
                  </Copy>
                </div>
                <div className="footer-col-links">
                  <Copy type="flicker">
                    <a href="#features">Features</a>
                  </Copy>
                  <Copy type="flicker">
                    <a href="#start">Start</a>
                  </Copy>
                </div>
              </div>
            </div>

            <div className="footer-row">
              <div className="footer-copyright">
                <Copy type="flicker">
                  <p>© {new Date().getFullYear()} Kiosk</p>
                </Copy>
                <Copy type="flicker">
                  <p className="bodyCopy">
                    Multi-tenant commerce. Tenant isolation by design.
                  </p>
                </Copy>
              </div>
            </div>
          </div>
        </footer>
      </ThemeConfigProvider>
    </StorefrontEditProvider>
  );
}
