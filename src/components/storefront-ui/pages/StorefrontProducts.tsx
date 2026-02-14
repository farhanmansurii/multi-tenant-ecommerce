'use client';

import { useMemo, useRef, useState, useEffect } from 'react';

import Copy from '@/components/storefront-ui/Copy/Copy';
import Product from '@/components/storefront-ui/Product/Product';
import { gsap } from 'gsap';
import { useThemeConfig } from '@/components/storefront-ui/storefront/ThemeConfigProvider';
import { EditableText } from '@/components/storefront-ui/edit/EditableText';

type MinimalProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  tags: string[];
  images?: Array<{ url: string }>;
};

export default function StorefrontProducts({ products }: { products: MinimalProduct[] }) {
  const theme = useThemeConfig();
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const p of products) for (const t of p.tags || []) tags.add(t);
    return ['All', ...Array.from(tags).slice(0, 4)];
  }, [products]);

  const [activeTag, setActiveTag] = useState(allTags[0] || 'All');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isAnimating, setIsAnimating] = useState(false);

  const productRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isInitialMount = useRef(true);

  const handleFilterChange = (newTag: string) => {
    if (isAnimating) return;
    if (newTag === activeTag) return;

    setIsAnimating(true);
    setActiveTag(newTag);

    gsap.killTweensOf(productRefs.current);

    gsap.to(productRefs.current, {
      opacity: 0,
      scale: 0.5,
      duration: 0.25,
      stagger: 0.05,
      ease: 'power3.out',
      onComplete: () => {
        const filtered =
          newTag === 'All'
            ? products
            : products.filter((p) => (p.tags || []).includes(newTag));
        setFilteredProducts(filtered);
      },
    });
  };

  useEffect(() => {
    productRefs.current = productRefs.current.slice(0, filteredProducts.length);
    gsap.killTweensOf(productRefs.current);

    gsap.fromTo(
      productRefs.current,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1,
        duration: isInitialMount.current ? 0.5 : 0.25,
        stagger: 0.05,
        ease: 'power3.out',
        onComplete: () => {
          setIsAnimating(false);
          isInitialMount.current = false;
        },
      }
    );
  }, [filteredProducts]);

  return (
    <>
      <section className="products-header">
        <div className="container">
          <Copy animateOnScroll={false} delay={0.65}>
            <EditableText as="h1" label="Catalog title" path="catalog.title" fallback={theme.content.catalog.title} />
          </Copy>
          <div className="products-header-divider"></div>
          <div className="product-filter-bar">
            <div className="filter-bar-header">
              <p className="bodyCopy">
                <EditableText
                  as="span"
                  label="Catalog filters label"
                  path="catalog.filtersLabel"
                  fallback={theme.content.catalog.filtersLabel}
                />
              </p>
            </div>
            <div className="filter-bar-tags">
              {allTags.map((tag) => (
                <p
                  key={tag}
                  className={`bodyCopy ${activeTag === tag ? 'active' : ''}`}
                  onClick={() => handleFilterChange(tag)}
                  style={{ cursor: isAnimating ? 'not-allowed' : 'pointer' }}
                >
                  {tag}
                </p>
              ))}
            </div>
            <div className="filter-bar-colors">
              {['Black', 'Stone', 'Ice', 'Grey', 'White'].map((color) => (
                <span
                  key={color}
                  className={`color-selector ${color.toLowerCase()}`}
                  style={{ opacity: 0.35 }}
                  title="Color filter is visual-only in this integration"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="product-list">
        <div className="container">
          {filteredProducts.map((p, index) => (
            <Product
              key={p.id}
              product={{
                ...p,
                imageUrl: p.images?.[0]?.url || '/storefront/products/product_1.png',
              }}
              showAddToCart={true}
              innerRef={(el: HTMLDivElement | null) => {
                productRefs.current[index] = el;
              }}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
