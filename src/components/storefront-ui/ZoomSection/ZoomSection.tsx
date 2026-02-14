'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Copy from '@/components/storefront-ui/Copy/Copy';
import { EditableText } from '@/components/storefront-ui/edit/EditableText';

gsap.registerPlugin(ScrollTrigger);

export default function ZoomSection({
  imageUrl,
  eyebrow,
  headline,
  body,
}: {
  imageUrl: string;
  eyebrow: string;
  headline: string;
  body: string;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!rootRef.current || !imgRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(imgRef.current, { scale: 1.05 });
      const tween = gsap.to(imgRef.current, {
        scale: 1.25,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      return () => tween.kill();
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="zoom-section" ref={rootRef}>
      <div className="zoom-section-inner">
        <div className="zoom-section-img">
          <img ref={imgRef} src={imageUrl} alt="" />
        </div>
        <div className="zoom-section-copy">
          <Copy type="flicker">
            <EditableText as="p" label="Zoom eyebrow" path="zoomSection.eyebrow" fallback={eyebrow} />
          </Copy>
          <Copy>
            <EditableText as="h3" label="Zoom headline" path="zoomSection.headline" fallback={headline} />
          </Copy>
          <Copy>
            <p className="bodyCopy">
              <EditableText as="span" label="Zoom body" path="zoomSection.body" fallback={body} multiline />
            </p>
          </Copy>
        </div>
      </div>
    </section>
  );
}
