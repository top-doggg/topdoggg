import { useEffect } from "react";
import SiteShell from "./app/SiteShell.jsx";
import { productById } from "./content/products.js";
import { getPrintifyCheckoutUrl } from "./printify.js";
import { trackDiscoveryEvent } from "./lib/discovery-telemetry.js";
import "./storefront.css";

export default function ProductDetail({ productId }) {
  const product = productById(productId);

  useEffect(() => {
    if (!product) return;
    document.title = product.name + " | DE.LA.COSTA";
    trackDiscoveryEvent("shop_product_view", { contentType: "product", contentId: product.id });
  }, [product]);

  if (!product) {
    return <SiteShell mainId="product-main"><main id="product-main" className="project-missing"><h1>That edition is not currently available.</h1><a href="/shop">Return to the shop</a></main></SiteShell>;
  }

  const checkoutUrl = getPrintifyCheckoutUrl([{ id: product.id, size: "M" }]);

  return <SiteShell mainId="product-main"><main id="product-main">
    <section className="project-hero">
      <div className="product-gallery">
        <img src={product.image} alt={product.name + ", front view"} fetchPriority="high" loading="eager" decoding="async" />
        <img src={product.backImage} alt={product.name + ", back view"} loading="lazy" decoding="async" />
      </div>
      <div>
        <span>{product.badge} / DE.LA.COSTA Edition 001</span>
        <h1>{product.name}</h1>
        <p>{product.story}</p>
        <p><strong>From {product.price}</strong></p>
        <p>{product.fit}. Final sizes, current availability, shipping, taxes, and payment are confirmed in the secure Printify store.</p>
        <p><a href={checkoutUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackDiscoveryEvent("shop_outbound", { contentType: "product", contentId: product.id, destination: "printify" })}>View in secure store</a></p>
        <p><a href="/fulfillment-policy">Shipping &amp; returns policy</a></p>
      </div>
    </section>
  </main></SiteShell>;
}
