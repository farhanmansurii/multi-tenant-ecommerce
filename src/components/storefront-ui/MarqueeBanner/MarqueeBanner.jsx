import { useRef } from "react";

import Copy from "../Copy/Copy";
import { useThemeConfig } from "@/components/storefront-ui/storefront/ThemeConfigProvider";
import { EditableText } from "@/components/storefront-ui/edit/EditableText";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MarqueeBanner = () => {
  const config = useThemeConfig();
  const marqueeBannerRef = useRef(null);
  const marquee1Ref = useRef(null);
  const marquee2Ref = useRef(null);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: marqueeBannerRef.current,
        start: "top bottom",
        end: "150% top",
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;

          const marquee1X = 25 - progress * 50;
          gsap.set(marquee1Ref.current, { x: `${marquee1X}%` });

          const marquee2X = -25 + progress * 50;
          gsap.set(marquee2Ref.current, { x: `${marquee2X}%` });
        },
      });
    },
    { scope: marqueeBannerRef }
  );

  return (
    <section className="marquee-banner" ref={marqueeBannerRef}>
      <div className="marquees">
        <div className="marquee-header marquee-header-1" ref={marquee1Ref}>
          <EditableText as="h1" label="Marquee line 1" path="marquee.line1" fallback={config.content.marquee.line1} />
        </div>
        <div className="marquee-header marquee-header-2" ref={marquee2Ref}>
          <EditableText as="h1" label="Marquee line 2" path="marquee.line2" fallback={config.content.marquee.line2} />
        </div>
      </div>
      <div className="banner">
        <div className="banner-content">
          <Copy type="flicker">
            <EditableText as="p" label="Marquee badge" path="marquee.badge" fallback={config.content.marquee.badge} />
          </Copy>
          <Copy>
            <EditableText as="h4" label="Marquee headline" path="marquee.headline" fallback={config.content.marquee.headline} />
          </Copy>
        </div>
        <div className="banner-img">
          <img src={config.content.marquee.imageUrl} alt="" />
        </div>
        <div className="banner-logo">
          <h5>{config?.name || "Store"}</h5>
        </div>
      </div>
    </section>
  );
};

export default MarqueeBanner;
