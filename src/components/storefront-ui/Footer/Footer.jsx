import Link from "next/link";

import { useStoreSlug } from "@/components/storefront-ui/hooks/useStoreSlug";
import { useThemeConfig } from "@/components/storefront-ui/storefront/ThemeConfigProvider";

const Footer = () => {
  const slug = useStoreSlug();
  const config = useThemeConfig();

  const hasPolicies =
    Boolean(config.termsOfService) || Boolean(config.privacyPolicy) || Boolean(config.refundPolicy);
  return (
    <>
      <footer>
        <div className="container">
          <div className="footer-row">
            <div className="footer-col">
              <div className="footer-col-header">
                <p className="bodyCopy">Root</p>
              </div>
              <div className="footer-col-links">
                <Link href={slug ? `/stores/${slug}` : "/stores"}>Index</Link>
                <Link href={slug ? `/stores/${slug}/products` : "/stores"}>Products</Link>
                <Link href={slug ? `/stores/${slug}/cart` : "/stores"}>Cart</Link>
                <Link href={slug ? `/stores/${slug}/orders` : "/stores"}>Orders</Link>
                <Link href={slug ? `/stores/${slug}/account` : "/stores"}>Account</Link>
              </div>
            </div>
            <div className="footer-col">
              <div className="footer-col-header">
                <p className="bodyCopy">Connect Feed</p>
              </div>
              <div className="footer-col-links">
                {config.contactEmail ? <a href={`mailto:${config.contactEmail}`}>Email</a> : null}
                <Link href={slug ? `/stores/${slug}/about` : "/stores"}>About</Link>
              </div>
            </div>
            <div className="footer-col">
              <div className="footer-col-header">
                <p className="bodyCopy">Ops</p>
              </div>
              <div className="footer-col-links">
                <p>{config.shippingEnabled ? "Shipping Enabled" : "Pickup / Manual Delivery"}</p>
                <p>
                  Payments:{" "}
                  {config.paymentMethods?.length
                    ? config.paymentMethods.join(", ")
                    : config.codEnabled
                      ? "cod"
                      : "configured"}
                </p>
                {config.freeShippingThreshold ? (
                  <p>Free shipping: {config.freeShippingThreshold}+</p>
                ) : null}
              </div>
            </div>
            {hasPolicies ? (
              <div className="footer-col">
                <div className="footer-col-header">
                  <p className="bodyCopy">Policies</p>
                </div>
                <div className="footer-col-links">
                  {config.termsOfService ? <Link href={`/stores/${config.slug}/terms`}>Terms</Link> : null}
                  {config.privacyPolicy ? <Link href={`/stores/${config.slug}/privacy`}>Privacy</Link> : null}
                  {config.refundPolicy ? <Link href={`/stores/${config.slug}/refunds`}>Refunds</Link> : null}
                </div>
              </div>
            ) : null}
          </div>
          <div className="footer-row">
            <div className="footer-copyright">
              <h5>{config.name}</h5>
              <p className="bodyCopy">&copy;2025 All modules reserved.</p>
              <p className="bodyCopy" id="copyright-text">
                Powered by Kiosk
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
