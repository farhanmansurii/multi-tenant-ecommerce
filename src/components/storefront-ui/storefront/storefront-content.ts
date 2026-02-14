import type { StoreData } from '@/lib/domains/stores/types';

export type StorefrontContentMode = 'defaults' | 'store' | 'custom';

export type StorefrontContent = {
  hero: {
    headline: string;
    imageUrl: string;
    footerLeftLabel: string;
    footerRightLabel: string;
  };
  about: {
    eyebrow: string;
    headline: string;
    footerLabel: string;
  };
  featured: {
    eyebrow: string;
    headlineTop: string;
    headlineBottom: string;
    leftLabel: string;
    rightCtaLabel: string;
  };
  zoomSection: {
    enabled: boolean;
    imageSource: 'static' | 'product';
    imageUrl: string;
    productSlug?: string;
    eyebrow: string;
    headline: string;
    body: string;
  };
  catalog: {
    title: string;
    filtersLabel: string;
  };
  marquee: {
    line1: string;
    line2: string;
    badge: string;
    headline: string;
    imageUrl: string;
  };
  textBlock: {
    headline: string;
    paragraphs: [string, string];
  };
  peelReveal: {
    headerLeft: string;
    footerStatus: string;
    imageUrl: string;
    headline: string;
    introLeft: string;
    introRight: string;
  };
  cta: {
    sideImageLeftUrl: string;
    sideCopy: string;
    headline: string;
    mainImageUrl: string;
    sideImageRightUrl: string;
    buttonLabel: string;
  };
  pdp: {
    chromaLabel: string;
    sizeLabel: string;
    addToBagLabel: string;
    saveItemLabel: string;
    specsTitle: string;
    shippingTitle: string;
    shippingBody: string;
    relatedLabel: string;
  };
};

export const defaultStorefrontContent: StorefrontContent = {
  hero: {
    headline: 'Silhouettes for the Next Era',
    imageUrl: '/storefront/home/hero.png',
    footerLeftLabel: 'Void Index',
    footerRightLabel: 'Model v.23',
  },
  about: {
    eyebrow: 'Clothing reduced to pure signal',
    headline:
      'Our collections are built for the frictionless, the fast, and the quietly defiant.',
    footerLabel: '/ Core State /',
  },
  featured: {
    eyebrow: 'Featured Units',
    headlineTop: 'Selected',
    headlineBottom: 'Garments',
    leftLabel: 'Primary Set',
    rightCtaLabel: 'View Archive',
  },
  zoomSection: {
    enabled: true,
    imageSource: 'static',
    imageUrl: '/storefront/spotlight/spotlight_img_05.jpg',
    productSlug: '',
    eyebrow: 'Spotlight',
    headline: 'A single image can carry the brand.',
    body: 'Use this section for a signature shot or campaign frame. Keep it simple: one image, one message.',
  },
  catalog: {
    title: 'Wardrobe Circulation',
    filtersLabel: 'Filters',
  },
  marquee: {
    line1: 'Transmission lost in neutral space',
    line2: 'Synthetic forms archive the signal',
    badge: '[ Frame Shift ]',
    headline: 'Modular silence across systems',
    imageUrl: '/storefront/marquee-banner/marquee_banner_01.png',
  },
  textBlock: {
    headline: 'Designed absence, engineered silence.',
    paragraphs: [
      'Designed for quiet tension. Built on structure, not spectacle. Each piece functions with intent, nothing more. Neutral in tone, deliberate in volume, uniform for moving through static.',
      'No ornament. No history. Just form engineered to remain. Indifferent to season, untouched by noise. Modular in cut, detached in presence. A system for those who exit the frame.',
    ],
  },
  peelReveal: {
    headerLeft: 'Signal type: Neutral',
    footerStatus: 'Status: Detached',
    imageUrl: '/storefront/peel-reveal/peel-reveal-img.jpg',
    headline: 'The uniform holds no allegiance',
    introLeft: 'Signal',
    introRight: 'Motion',
  },
  cta: {
    sideImageLeftUrl: '/storefront/cta/cta_img_01.jpg',
    sideCopy:
      'Built to exist outside context, these forms prioritize neutrality, and distortion.',
    headline: 'A field test in silhouettes',
    mainImageUrl: '/storefront/cta/cta_img_02.jpg',
    sideImageRightUrl: '/storefront/cta/cta_img_03.jpg',
    buttonLabel: 'Enter Wardrobe',
  },
  pdp: {
    chromaLabel: 'Chroma',
    sizeLabel: 'Form Size',
    addToBagLabel: 'Add To Bag',
    saveItemLabel: 'Save Item',
    specsTitle: 'Specifications',
    shippingTitle: 'Shipping Terms',
    shippingBody:
      'Orders are processed within 5 business days and shipped with tracking. Delivery times vary by region.',
    relatedLabel: 'Related Units',
  },
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function deepMerge<T extends Record<string, any>>(base: T, patch: Record<string, unknown>): T {
  const out: any = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepMerge(asObject(out[k] ?? {}), asObject(v));
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function resolveStorefrontContent(store: StoreData): StorefrontContent {
  const settings = store.settings || {};
  const mode = (settings.storefrontContentMode || 'store') as StorefrontContentMode;

  if (mode === 'defaults') return defaultStorefrontContent;

  const storeDerived: StorefrontContent = {
    ...defaultStorefrontContent,
    hero: {
      ...defaultStorefrontContent.hero,
      headline: store.description || defaultStorefrontContent.hero.headline,
    },
    about: {
      ...defaultStorefrontContent.about,
      eyebrow: store.name || defaultStorefrontContent.about.eyebrow,
      headline: store.description || defaultStorefrontContent.about.headline,
    },
    catalog: {
      ...defaultStorefrontContent.catalog,
      title: store.name ? `${store.name} Catalog` : defaultStorefrontContent.catalog.title,
    },
  };

  if (mode === 'store') return storeDerived;

  // custom: merge published content over store-derived base.
  return deepMerge(storeDerived, asObject(settings.storefrontContent)) as StorefrontContent;
}
