"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useStorefrontStore } from "@/lib/state/storefront/storefront-store";
import { useStoreSlug } from "@/components/storefront-ui/hooks/useStoreSlug";

/** @param {{ product: any, showAddToCart?: boolean, className?: string, innerRef?: any, style?: any }} props */
const Product = ({
  product,
  showAddToCart = true,
  className = "",
  innerRef = undefined,
  style = undefined,
}) => {
  const slug = useStoreSlug();
  const addToCartApi = useStorefrontStore((state) => state.addToCartApi);
  const pathname = usePathname();

  const handleImageClick = () => {
    if (pathname?.includes("/products/")) {
      window.dispatchEvent(new CustomEvent("scrollToTop"));
    }
  };

  const href =
    slug && product?.slug ? `/stores/${slug}/products/${product.slug}` : "#";

  const imageUrl =
    product?.imageUrl ||
    product?.image ||
    product?.images?.[0]?.url ||
    "/storefront/products/product_1.png";

  return (
    <div className={`product ${className}`} ref={innerRef} style={style}>
      <Link href={href} className="product-img" onClick={handleImageClick}>
        <img src={imageUrl} alt={product?.name || ""} />
      </Link>
      <div className="product-info">
        <div className="product-info-wrapper">
          <p>{product?.name}</p>
          <p>${Number(product?.price || 0)}</p>
        </div>
        {showAddToCart && (
          <button
            className="add-to-cart-btn"
            onClick={() => {
              if (!slug || !product?.id) return;
              addToCartApi({ slug, productId: product.id, variantId: product.variantId, qty: 1 });
            }}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default Product;
