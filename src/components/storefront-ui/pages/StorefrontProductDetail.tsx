'use client';

import { useEffect, useMemo, useRef } from 'react';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Copy from '@/components/storefront-ui/Copy/Copy';
import Product from '@/components/storefront-ui/Product/Product';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { useThemeConfig } from '@/components/storefront-ui/storefront/ThemeConfigProvider';
import { EditableText } from '@/components/storefront-ui/edit/EditableText';

gsap.registerPlugin(ScrollTrigger);

type MinimalProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: Array<{ url: string }>;
  shortDescription?: string | null;
  description?: string | null;
};

const FALLBACK_SHOTS = [
  '/storefront/product/product_shot_01.jpg',
  '/storefront/product/product_shot_02.jpg',
  '/storefront/product/product_shot_03.jpg',
  '/storefront/product/product_shot_04.jpg',
  '/storefront/product/product_shot_05.jpg',
];

export default function StorefrontProductDetail({
  slug,
  product,
  relatedProducts,
}: {
  slug: string;
  product: MinimalProduct;
  relatedProducts: Array<{ id: string; slug: string; name: string; price: number; images?: Array<{ url: string }> }>;
}) {
  const theme = useThemeConfig();
  const heroRef = useRef<HTMLElement | null>(null);
  const activeMinimapIndex = useRef(0);

  const addToCartApi = useStorefrontStore((s) => s.addToCartApi);

  const snapshotUrls = useMemo(() => {
    const urls = (product.images || []).map((i) => i.url).filter(Boolean);
    const out: string[] = [];
    for (let i = 0; i < 5; i++) out.push(urls[i] || FALLBACK_SHOTS[i]);
    return out;
  }, [product.images]);

  useEffect(() => {
    const handleScrollToTop = () => {
      window.scrollTo(0, 0);
      setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    window.addEventListener('scrollToTop', handleScrollToTop);
    return () => window.removeEventListener('scrollToTop', handleScrollToTop);
  }, []);

  useGSAP(() => {
    const snapshots = document.querySelectorAll('.product-snapshot');
    const minimapImages = document.querySelectorAll('.product-snapshot-minimap-img');
    const totalImages = snapshots.length;
    if (!totalImages) return;

    gsap.set(snapshots[0], { y: '0%', scale: 1 });
    gsap.set(minimapImages[0], { scale: 1.25 });
    for (let i = 1; i < totalImages; i++) {
      gsap.set(snapshots[i], { y: '100%', scale: 1 });
      gsap.set(minimapImages[i], { scale: 1 });
    }

    const st = ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: `+=${window.innerHeight * 5}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        let currentActiveIndex = 0;

        for (let i = 1; i < totalImages; i++) {
          const imageStart = (i - 1) / (totalImages - 1);
          const imageEnd = i / (totalImages - 1);

          let localProgress = (progress - imageStart) / (imageEnd - imageStart);
          localProgress = Math.max(0, Math.min(1, localProgress));

          const yValue = 100 - localProgress * 100;
          gsap.set(snapshots[i], { y: `${yValue}%` });

          const scaleValue = 1 + localProgress * 0.5;
          gsap.set(snapshots[i - 1], { scale: scaleValue });

          if (localProgress >= 0.5) currentActiveIndex = i;
        }

        if (currentActiveIndex !== activeMinimapIndex.current) {
          gsap.to(minimapImages[currentActiveIndex], {
            scale: 1.25,
            duration: 0.3,
            ease: 'power2.out',
          });

          for (let i = 0; i < currentActiveIndex; i++) {
            gsap.to(minimapImages[i], { scale: 0, duration: 0.3, ease: 'power2.out' });
          }

          for (let i = currentActiveIndex + 1; i < totalImages; i++) {
            gsap.to(minimapImages[i], { scale: 1, duration: 0.3, ease: 'power2.out' });
          }

          activeMinimapIndex.current = currentActiveIndex;
        }
      },
    });

    window.scrollTo(0, 0);
    ScrollTrigger.refresh();

    return () => st.kill();
  }, []);

  return (
    <>
      <section className="product-hero" ref={heroRef}>
        <div className="product-hero-col product-snapshots">
          {snapshotUrls.map((url, idx) => (
            <div key={url} className="product-snapshot">
              <img src={url} alt="" />
            </div>
          ))}
          <div className="product-snapshot-minimap">
            {snapshotUrls.map((url) => (
              <div key={`${url}-minimap`} className="product-snapshot-minimap-img">
                <img src={url} alt="" />
              </div>
            ))}
          </div>
        </div>
        <div className="product-hero-col product-meta">
          <div className="product-meta-container">
            <div className="product-meta-header">
              <h3>{product.name}</h3>
              <h3>
                {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: theme.currency || 'USD',
                }).format(Number(product.price || 0))}
              </h3>
            </div>
            <div className="product-meta-header-divider"></div>
            <div className="product-color-container">
              <p className="md">
                <EditableText as="span" label="PDP chroma label" path="pdp.chromaLabel" fallback={theme.content.pdp.chromaLabel} />
              </p>
              <div className="product-colors">
                <div className="product-color">
                  <span></span>
                </div>
              </div>
            </div>
            <div className="product-sizes-container">
              <p className="md">
                <EditableText as="span" label="PDP size label" path="pdp.sizeLabel" fallback={theme.content.pdp.sizeLabel} />
              </p>
              <div className="product-sizes">
                <p className="md selected">[ S ]</p>
                <p className="md">[ M ]</p>
                <p className="md">[ L ]</p>
                <p className="md">[ XL ]</p>
              </div>
            </div>
            <div className="product-meta-buttons">
              <button
                className="primary"
                onClick={() => addToCartApi({ slug, productId: product.id, qty: 1 })}
              >
                <EditableText as="span" label="PDP add to bag" path="pdp.addToBagLabel" fallback={theme.content.pdp.addToBagLabel} />
              </button>
              <button className="secondary">
                <EditableText as="span" label="PDP save item" path="pdp.saveItemLabel" fallback={theme.content.pdp.saveItemLabel} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="product-details specifications">
        <div className="product-col product-col-copy">
          <div className="product-col-copy-wrapper">
            <Copy>
              <EditableText as="h4" label="PDP specs title" path="pdp.specsTitle" fallback={theme.content.pdp.specsTitle} />
            </Copy>
            <Copy>
              <p className="bodyCopy lg">
                {product.shortDescription || product.description || 'Crafted for daily use with clean utility details.'}
              </p>
            </Copy>
          </div>
        </div>
        <div className="product-col product-col-img">
          <img src={snapshotUrls[2]} alt="" />
        </div>
      </section>

      <section className="product-details shipping-details">
        <div className="product-col product-col-img">
          <img src={snapshotUrls[3]} alt="" />
        </div>
        <div className="product-col product-col-copy">
          <div className="product-col-copy-wrapper">
            <Copy>
              <EditableText as="h4" label="PDP shipping title" path="pdp.shippingTitle" fallback={theme.content.pdp.shippingTitle} />
            </Copy>
            <Copy>
              <p className="bodyCopy lg">
                {theme.shippingEnabled
                  ? (
                      <EditableText
                        as="span"
                        label="PDP shipping body"
                        path="pdp.shippingBody"
                        fallback={theme.content.pdp.shippingBody}
                        multiline
                      />
                    )
                  : 'Shipping is currently disabled for this store.'}
              </p>
            </Copy>
          </div>
        </div>
      </section>

      <section className="related-products">
        <div className="related-products-header">
          <Copy type="flicker">
            <EditableText as="p" label="PDP related label" path="pdp.relatedLabel" fallback={theme.content.pdp.relatedLabel} />
          </Copy>
        </div>
        <div className="related-products-container">
          <div className="container">
            {relatedProducts.slice(0, 4).map((p) => (
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
    </>
  );
}
