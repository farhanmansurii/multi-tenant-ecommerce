'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';

import Preloader, { isInitialLoad } from '@/components/storefront-ui/Preloader/Preloader';
import DotMatrix from '@/components/storefront-ui/DotMatrix/DotMatrix';
import BrandIcon from '@/components/storefront-ui/BrandIcon/BrandIcon';
import MarqueeBanner from '@/components/storefront-ui/MarqueeBanner/MarqueeBanner';
import TextBlock from '@/components/storefront-ui/TextBlock/TextBlock';
import PeelReveal from '@/components/storefront-ui/PeelReveal/PeelReveal';
import CTA from '@/components/storefront-ui/CTA/CTA';
import Copy from '@/components/storefront-ui/Copy/Copy';
import Product from '@/components/storefront-ui/Product/Product';
import ZoomSection from '@/components/storefront-ui/ZoomSection/ZoomSection';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useThemeConfig } from '@/components/storefront-ui/storefront/ThemeConfigProvider';
import { EditableText } from '@/components/storefront-ui/edit/EditableText';

gsap.registerPlugin(ScrollTrigger);

type MinimalProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images?: Array<{ url: string }>;
};

export default function StorefrontHome({
  slug,
  zoomImageUrl,
  featuredProducts,
}: {
  slug: string;
  zoomImageUrl: string;
  featuredProducts: MinimalProduct[];
}) {
  const theme = useThemeConfig();
  const heroImgRef = useRef<HTMLDivElement | null>(null);
  const heroHeaderRef = useRef<HTMLDivElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);

  const featured = useMemo(() => featuredProducts.slice(0, 4), [featuredProducts]);

  useEffect(() => {
    // Keep behavior consistent with the reference: no-op here, but ensures `isInitialLoad` is set after first load.
    return () => {};
  }, []);

  useGSAP(() => {
    if (!heroImgRef.current || !heroHeaderRef.current) return;

    gsap.set(heroImgRef.current, { y: 1000 });
    gsap.to(heroImgRef.current, {
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
      delay: isInitialLoad ? 5.75 : 1,
    });

    gsap.to(heroHeaderRef.current, {
      y: 150,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  return (
    <>
      <Preloader />

      <section className="hero" ref={heroSectionRef}>
        <DotMatrix color="#969992" dotSize={2} spacing={5} opacity={0.9} delay={isInitialLoad ? 6 : 1.125} />
        <div className="container">
          <div className="hero-header" ref={heroHeaderRef}>
            <Copy animateOnScroll={false} delay={isInitialLoad ? 5.5 : 0.65}>
              <EditableText as="h1" label="Hero headline" path="hero.headline" fallback={theme.content.hero.headline} />
            </Copy>
          </div>
        </div>
        <div className="hero-img" ref={heroImgRef}>
          <img src={theme.content.hero.imageUrl} alt="" />
        </div>
        <div className="section-footer">
          <Copy type="flicker" delay={isInitialLoad ? 7.5 : 0.65} animateOnScroll={false}>
            <EditableText as="p" label="Hero footer (left)" path="hero.footerLeftLabel" fallback={theme.content.hero.footerLeftLabel} />
          </Copy>
          <Copy type="flicker" delay={isInitialLoad ? 7.5 : 0.65} animateOnScroll={false}>
            <EditableText as="p" label="Hero footer (right)" path="hero.footerRightLabel" fallback={theme.content.hero.footerRightLabel} />
          </Copy>
        </div>
      </section>

      <section className="about">
        <div className="container">
          <div className="about-copy">
            <Copy type="flicker">
              <EditableText as="p" label="About eyebrow" path="about.eyebrow" fallback={theme.content.about.eyebrow} />
            </Copy>
            <Copy>
              <EditableText as="h3" label="About headline" path="about.headline" fallback={theme.content.about.headline} multiline />
            </Copy>
            <div className="about-icon">
              <BrandIcon />
            </div>
          </div>
        </div>
        <div className="section-footer light">
          <Copy type="flicker">
            <EditableText as="p" label="About footer" path="about.footerLabel" fallback={theme.content.about.footerLabel} />
          </Copy>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <div className="featured-products-header">
            <Copy type="flicker">
              <EditableText as="p" label="Featured eyebrow" path="featured.eyebrow" fallback={theme.content.featured.eyebrow} />
            </Copy>
            <Copy>
              <h3>
                <EditableText as="span" label="Featured headline (top)" path="featured.headlineTop" fallback={theme.content.featured.headlineTop} /> <br />{' '}
                <EditableText as="span" label="Featured headline (bottom)" path="featured.headlineBottom" fallback={theme.content.featured.headlineBottom} />
              </h3>
            </Copy>
          </div>
          <div className="featured-products-separator">
            <div className="featured-products-divider"></div>
            <div className="featured-products-labels">
              <Copy type="flicker">
                <EditableText as="p" label="Featured left label" path="featured.leftLabel" fallback={theme.content.featured.leftLabel} />
              </Copy>
              <Copy type="flicker">
                <Link href={`/stores/${slug}/products`}>
                  <EditableText as="span" label="Featured right CTA" path="featured.rightCtaLabel" fallback={theme.content.featured.rightCtaLabel} />
                </Link>
              </Copy>
            </div>
          </div>
          <div className="featured-products-list">
            {featured.map((p) => (
              <Product
                key={p.id}
                product={{
                  ...p,
                  imageUrl: p.images?.[0]?.url || '/storefront/products/product_1.png',
                }}
                showAddToCart={true}
              />
            ))}
          </div>
        </div>
      </section>

      {theme.content.zoomSection.enabled ? (
        <ZoomSection
          imageUrl={zoomImageUrl}
          eyebrow={theme.content.zoomSection.eyebrow}
          headline={theme.content.zoomSection.headline}
          body={theme.content.zoomSection.body}
        />
      ) : null}

      <MarqueeBanner />
      <TextBlock />
      <PeelReveal />
      <CTA />
    </>
  );
}
