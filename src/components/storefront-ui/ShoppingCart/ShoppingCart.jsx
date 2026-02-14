"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { useStorefrontStore } from "@/lib/state/storefront/storefront-store";
import { useStoreSlug } from "@/components/storefront-ui/hooks/useStoreSlug";
import { useThemeConfig } from "@/components/storefront-ui/storefront/ThemeConfigProvider";

const ShoppingCart = () => {
  const slug = useStoreSlug();
  const config = useThemeConfig();
  const [isHydrated, setIsHydrated] = useState(false);

  const isOpen = useStorefrontStore((s) => s.isCartOpen);
  const setCartOpen = useStorefrontStore((s) => s.setCartOpen);

  const cartItems = useStorefrontStore((s) => s.cart.items);
  const cartCount = useStorefrontStore((s) => s.cart.totalQuantity);
  const subtotal = useStorefrontStore((s) => s.cart.subtotal);

  const removeCartItemApi = useStorefrontStore((s) => s.removeCartItemApi);
  const updateCartItemQtyApi = useStorefrontStore((s) => s.updateCartItemQtyApi);
  const clearCartApi = useStorefrontStore((s) => s.clearCartApi);

  const toggleCart = () => {
    setCartOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div className="shopping-cart-container">
      <button className="cart-button" onClick={toggleCart}>
        <span className="cart-icon">BAG</span>
        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
      </button>

      <div
        className={`cart-sidebar ${isOpen ? "open" : ""}`}
        onWheel={(e) => {
          const target = e.currentTarget;
          const cartItems = target.querySelector(".cart-items");
          if (cartItems) {
            const { scrollTop, scrollHeight, clientHeight } = cartItems;
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

            if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
              e.stopPropagation();
            }
          }
        }}
      >
        <div className="cart-sidebar-content">
          <div className="cart-header">
            <h2>Bag</h2>
            <button className="cart-close" onClick={toggleCart}>
              Close
            </button>
          </div>
          <div
            className="cart-items"
            onWheel={(e) => {
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
          >
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <p>Your bag is empty</p>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const quantity = Number(item.quantity) || 1;
                return (
                  <div key={item.id || `${item.name}-${index}`} className="cart-item">
                    <div className="cart-item-image">
                      <img
                        src={item.image || "/storefront/products/product_1.png"}
                        alt={item.name || ""}
                      />
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-name-row">
                        <p className="cart-item-name">{item.name}</p>
                        {quantity > 1 && (
                          <span className="cart-item-quantity">{quantity}</span>
                        )}
                      </div>
                      <p className="cart-item-price">${item.price}</p>
                      <div className="cart-item-qty-controls">
                        <button
                          className="cart-item-qty-btn"
                          onClick={() => {
                            if (!slug || !item.id) return;
                            const nextQty = Math.max(0, quantity - 1);
                            if (nextQty === 0) {
                              removeCartItemApi({ slug, itemId: item.id });
                            } else {
                              updateCartItemQtyApi({ slug, itemId: item.id, qty: nextQty });
                            }
                          }}
                        >
                          -
                        </button>
                        <span className="cart-item-qty">{quantity}</span>
                        <button
                          className="cart-item-qty-btn"
                          onClick={() => {
                            if (!slug || !item.id) return;
                            updateCartItemQtyApi({ slug, itemId: item.id, qty: quantity + 1 });
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => {
                          if (!slug || !item.id) return;
                          removeCartItemApi({ slug, itemId: item.id });
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="cart-footer">
              <div className="cart-summary-row">
                <span>Total</span>
                <span>${Number(subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="cart-store-meta">
                <span>
                  Payments:{" "}
                  {config.paymentMethods?.length
                    ? config.paymentMethods.join(", ")
                    : config.codEnabled
                      ? "cod"
                      : "configured"}
                </span>
                <span>
                  Shipping:{" "}
                  {config.shippingEnabled
                    ? config.freeShippingThreshold
                      ? `free over ${config.freeShippingThreshold}+`
                      : "enabled"
                    : "disabled"}
                </span>
              </div>
              <div className="cart-footer-actions">
                <Link
                  className="cart-checkout"
                  href={slug ? `/stores/${slug}/checkout` : "#"}
                  onClick={() => {
                    if (!slug) return;
                    setCartOpen(false);
                  }}
                  aria-disabled={!isHydrated}
                >
                  Checkout
                </Link>
                <button
                  className="cart-clear"
                  onClick={() => {
                    if (!slug) return;
                    clearCartApi({ slug });
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
