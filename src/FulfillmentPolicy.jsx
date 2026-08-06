import { useEffect } from "react";
import "./storefront.css";

const INSTAGRAM_URL = "https://www.instagram.com/_de.la.costa_/";
const POLICY_URL = "https://trststudios.online/fulfillment-policy";

function PolicySchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Shipping & Returns Policy | TRST Studios",
    url: POLICY_URL,
    isPartOf: {
      "@type": "WebSite",
      name: "TRST Studios",
      url: "https://trststudios.online/",
    },
    dateModified: "2026-08-01",
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function FulfillmentPolicy() {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescription = document.querySelector('meta[name="description"]')?.content;
    const canonical = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.href;

    document.title = "Shipping & Returns Policy | TRST Studios";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      "TRST Studios made-to-order shipping, returns, and issue-resolution policy.",
    );
    canonical?.setAttribute("href", POLICY_URL);

    return () => {
      document.title = previousTitle;
      if (previousDescription) document.querySelector('meta[name="description"]')?.setAttribute("content", previousDescription);
      if (previousCanonical) canonical?.setAttribute("href", previousCanonical);
    };
  }, []);

  return (
    <div className="policy-page">
      <PolicySchema />
      <a className="skip-link" href="#policy-main">Skip to policy</a>
      <header className="policy-header">
        <a className="wordmark" href="/" aria-label="TRST Studios home">
          <strong>TRST STUDIOS</strong>
          <small>DE.LA.COSTA / Edition 001</small>
        </a>
        <a className="policy-shop-link" href="/#shop">Shop the collection</a>
      </header>

      <main id="policy-main">
        <section className="policy-hero">
          <span>Customer care</span>
          <h1>Shipping &amp;<br />Returns</h1>
          <p>Clear expectations for made-to-order work. Please read this policy before placing an order.</p>
          <small>Last updated August 1, 2026</small>
        </section>

        <section className="policy-content" aria-label="Shipping and returns policy">
          <article>
            <span>01</span>
            <div>
              <h2>Made to order</h2>
              <p>Every TRST Studios piece is produced after an order is placed through our Printify Pop-Up Store. This keeps each release intentional and helps us avoid unnecessary overproduction.</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h2>Production &amp; shipping</h2>
              <p>Production time and estimated delivery are shown in the secure Printify checkout before payment. Timing can vary by item, print provider, destination, carrier, and seasonal demand. These are estimates, not guaranteed delivery dates.</p>
              <p>Shipping charges, taxes, and the delivery address are confirmed during checkout. Please review them carefully before completing your purchase.</p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h2>Size &amp; address review</h2>
              <p>Use the product measurements and size details in the Printify store before ordering. Because items are made to order, we cannot exchange an item for a different size or color after purchase.</p>
              <p>Please enter a complete, accurate shipping address. Orders returned because an address is incomplete or invalid may only be eligible for a refund of the product price, not shipping costs.</p>
            </div>
          </article>
          <article>
            <span>04</span>
            <div>
              <h2>Returns &amp; exchanges</h2>
              <p>We do not accept returns or exchanges for change of mind, incorrect size selection, or color preference. Each item is made specifically after your order is submitted.</p>
              <p>Do not send an item back unless you have received return instructions. Unapproved returns cannot be processed.</p>
            </div>
          </article>
          <article>
            <span>05</span>
            <div>
              <h2>Damaged, misprinted, or defective items</h2>
              <p>If your order arrives damaged, misprinted, or defective, report the issue within 30 days of delivery using the support email in your order-confirmation message. Include your order ID and clear photo evidence of the issue.</p>
              <p>Eligible claims may receive a free reprint or a refund. The fulfillment team reviews each claim before a resolution is issued.</p>
            </div>
          </article>
          <article>
            <span>06</span>
            <div>
              <h2>Questions before you order?</h2>
              <p>For product or collection questions before checkout, <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">message DE.LA.COSTA on Instagram</a>. For an existing order or a print issue, use the support email included in your Printify order confirmation so the fulfillment team can locate your order quickly.</p>
            </div>
          </article>
        </section>
      </main>

      <footer className="policy-footer">
        <strong>TRST STUDIOS</strong>
        <a href="/">Return to the collection</a>
      </footer>
    </div>
  );
}
