"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";

import Copy from "../Copy/Copy";
import { useStoreSlug } from "@/components/storefront-ui/hooks/useStoreSlug";
import { useThemeConfig } from "@/components/storefront-ui/storefront/ThemeConfigProvider";
import { EditableText } from "@/components/storefront-ui/edit/EditableText";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CTA = () => {
  const slug = useStoreSlug();
  const theme = useThemeConfig();
  const ctaRef = useRef(null);

  useEffect(() => {
    const container = ctaRef.current;
    if (!container) return;

    const timer = setTimeout(() => {
      const leftImage = container.querySelector(
        ".cta-col:nth-child(1) .cta-side-img"
      );
      const rightImage = container.querySelector(
        ".cta-col:nth-child(3) .cta-side-img"
      );

      const st = ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          const leftTranslateY = 20 - progress * 30;
          gsap.set(leftImage, {
            y: `${leftTranslateY}rem`,
          });

          const rightTranslateY = -progress * 30;
          gsap.set(rightImage, {
            y: `${rightTranslateY}rem`,
          });
        },
      });

      return () => {
        st.kill();
      };
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="cta" ref={ctaRef}>
      <div className="container">
        <div className="cta-col">
          <div className="cta-side-img">
            <img src={theme.content.cta.sideImageLeftUrl} alt="" />
          </div>
          <div className="cta-col-copy">
            <Copy>
              <p className="bodyCopy sm">
                <EditableText
                  as="span"
                  label="CTA side copy"
                  path="cta.sideCopy"
                  fallback={theme.content.cta.sideCopy}
                  multiline
                />
              </p>
            </Copy>
          </div>
        </div>
        <div className="cta-col">
          <div className="cta-header">
            <Copy>
              <EditableText as="h3" label="CTA headline" path="cta.headline" fallback={theme.content.cta.headline} />
            </Copy>
          </div>
          <div className="cta-main-img">
            <img src={theme.content.cta.mainImageUrl} alt="" />
          </div>
        </div>
        <div className="cta-col">
          <div className="cta-side-img">
            <img src={theme.content.cta.sideImageRightUrl} alt="" />
          </div>
        </div>
      </div>
      <div className="container">
        <div className="cta-main-copy">
          <div className="btn">
            <Copy type="flicker">
              <Link href={slug ? `/stores/${slug}/products` : "/stores"}>
                <EditableText as="span" label="CTA button label" path="cta.buttonLabel" fallback={theme.content.cta.buttonLabel} />
              </Link>
            </Copy>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
