import { Metadata } from "next";

interface BaseMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "product" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
}

interface StoreMetadataOptions extends BaseMetadataOptions {
  storeName: string;
  storeDescription?: string;
  storeLogo?: string;
}

interface ProductMetadataOptions extends BaseMetadataOptions {
  productName: string;
  productDescription?: string;
  productPrice?: string;
  productImages?: string[];
  storeName: string;
  storeSlug: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://multi-tenant-ecommerce-self.vercel.app";
const appName = "Kiosk";
const appDescription =
  "Your personal storefront builder. Create, manage, and scale your online business with Kiosk.";

export function generateBaseMetadata(
  options: BaseMetadataOptions = {}
): Metadata {
  const {
    title = appName,
    description = appDescription,
    keywords = ["ecommerce", "online store", "multi-tenant", "shopping"],
    image = `${baseUrl}/og-image.png`,
    url = baseUrl,
    type = "website",
    publishedTime,
    modifiedTime,
    authors = ["Kiosk Team"],
    section,
    tags = [],
  } = options;

  const fullTitle = title === appName ? title : `${title} | ${appName}`;
  const fullKeywords = [...keywords, ...tags];

  return {
    title: fullTitle,
    description,
    keywords: fullKeywords.join(", "),
    authors: authors.map((author) => ({ name: author })),
    creator: "Kiosk",
    publisher: "Kiosk",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    } as const,

    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@trykiosk",
      site: "@trykiosk",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export function generateStoreMetadata(options: StoreMetadataOptions): Metadata {
  const { storeName, storeDescription, storeLogo, ...baseOptions } = options;

  const title = `${storeName} Store`;
  const description =
    storeDescription ||
    `Shop at ${storeName} - Discover amazing products and deals`;
  const image = storeLogo || `${baseUrl}/og-store.png`;
  const url = `${baseUrl}/stores/${
    options.url || storeName.toLowerCase().replace(/\s+/g, "-")
  }`;

  return generateBaseMetadata({
    ...baseOptions,
    title,
    description,
    image,
    url,
    type: "website",
    keywords: [
      "online store",
      "shopping",
      storeName,
      "ecommerce",
      "products",
      "deals",
      ...(baseOptions.keywords || []),
    ],
  });
}

export function generateProductMetadata(
  options: ProductMetadataOptions
): Metadata {
  const {
    productName,
    productDescription,
    productPrice,
    productImages = [],
    storeName,
    storeSlug,
    ...baseOptions
  } = options;

  const title = `${productName} - ${storeName}`;
  const description =
    productDescription ||
    `Buy ${productName} from ${storeName}. ${
      productPrice ? `Price: $${productPrice}` : ""
    }`;
  const image = productImages[0] || `${baseUrl}/og-product.png`;
  const url = `${baseUrl}/stores/${storeSlug}/products/${
    options.url || productName.toLowerCase().replace(/\s+/g, "-")
  }`;

  return generateBaseMetadata({
    ...baseOptions,
    title,
    description,
    image,
    url,
    type: "product",
    keywords: [
      productName,
      storeName,
      "product",
      "buy",
      "shop",
      "ecommerce",
      ...(baseOptions.keywords || []),
    ],
  });
}

export function generateDashboardMetadata(
  page: string,
  options: BaseMetadataOptions = {}
): Metadata {
  const pageTitles: Record<string, string> = {
    dashboard: "Dashboard",
    stores: "Stores",
    products: "Products",
    categories: "Categories",
    settings: "Settings",
    analytics: "Analytics",
  };

  const pageDescriptions: Record<string, string> = {
    dashboard: "Manage your stores and products from your dashboard",
    stores: "Create and manage your online stores",
    products: "Manage your product catalog",
    categories: "Organize your products with categories",
    settings: "Configure your store settings",
    analytics: "View your store analytics and insights",
  };

  const title = pageTitles[page] || page;
  const description =
    pageDescriptions[page] || `Manage your ${page} in the dashboard`;

  return generateBaseMetadata({
    ...options,
    title: `${title} | Dashboard`,
    description,
    url: `${baseUrl}/dashboard/${page}`,
  });
}

// Common metadata for different page types
export const commonMetadata = {
  home: generateBaseMetadata({
    title: appName,
    description: appDescription,
    keywords: [
      "ecommerce",
      "online store",
      "multi-tenant",
      "shopping",
      "platform",
    ],
  }),

  signIn: generateBaseMetadata({
    title: "Sign In",
    description: "Sign in to your account to manage your stores and products",
  }),

  notFound: generateBaseMetadata({
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist",
  }),
};
