import { useEffect } from "react";
import { products } from "./Storefront.jsx";
import "./storefront.css";

const INSTAGRAM_URL = "https://www.instagram.com/_de.la.costa_/";
const WHOLESALE_URL = "https://trststudios.online/wholesale";

function WholesaleSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "TRST Studios Retail Partner Preview",
    url: WHOLESALE_URL,
    isPartOf: { "@type": "WebSite", name: "TRST Studios", url: "https://trststudios.online/" },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function WholesalePreview() {
  useEffect(() => {
    const previousTitle = document.title;
    const previousRobots = document.querySelector('meta[name="robots"]')?.content;
    const canonical = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.href;

    document.title = "Retail Partner Preview | TRST Studios";
    document.querySelector('meta[name="robots"]')?.setAttribute("content", "noindex, nofollow");
    canonical?.setAttribute("href", WHOLESALE_URL);

    return () => {
      document.title = previousTitle;
      if (previousRobots) document.querySelector('meta[name="robots"]')?.setAttribute("content", previousRobots);
      if (previousCanonical) canonical?.setAttribute("href", previousCanonical);
    };
  }, []);

  return (
    <div className="wholesale-page">
      <WholesaleSchema />
      <a className="skip-link" href="#wholesale-main">Skip to deck</a>
      <header className="wholesale-header">
        <a className="wordmark" href="/" aria-label="TRST Studios home">
          <strong>TRST STUDIOS</strong>
          <small>Retail Partner Preview</small>
        </a>
        <a href="/" className="wholesale-home-link">Public storefront</a>
      </header>

      <main id="wholesale-main">
        <section className="wholesale-hero">
          <div>
            <span>Independent art / apparel</span>
            <h1>DE.LA.COSTA<br />for the floor.</h1>
          </div>
          <p>TRST Studios translates a living archive of community, place, and visual storytelling into graphic apparel with a distinct point of view.</p>
          <small>Retail Partner Preview / Edition 001 / August 2026</small>
        </section>

        <section className="wholesale-statement">
          <p>Not trend-chasing graphics. Pieces built around cultural memory, local pride, and the emotional weight inside everyday life.</p>
          <div>
            <span>Brand position</span>
            <strong>Streetwear with a real place behind it.</strong>
          </div>
        </section>

        <section className="wholesale-section" aria-labelledby="collection-heading">
          <header>
            <span>01 / The capsule</span>
            <h2 id="collection-heading">Edition 001</h2>
            <p>A focused graphic-tee capsule designed to work as a small opening order, a shop-floor story, or an exclusive retail edit.</p>
          </header>
          <div className="wholesale-products">
            {products.map((product) => (
              <article key={product.id}>
                <img src={product.image} alt={`${product.name} front view`} loading="lazy" decoding="async" />
                <div><span>{product.badge}</span><h3>{product.name}</h3><p>{product.story}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="wholesale-section wholesale-linesheet" aria-labelledby="linesheet-heading">
          <header>
            <span>02 / Line sheet</span>
            <h2 id="linesheet-heading">Retail overview</h2>
            <p>Current public pricing and product direction. Wholesale pricing, MOQ, and delivery are quoted by style and order quantity.</p>
          </header>
          <div className="line-sheet-table" role="table" aria-label="Edition 001 line sheet">
            <div className="line-sheet-head" role="row"><span role="columnheader">Style</span><span role="columnheader">Fit</span><span role="columnheader">Sizes</span><span role="columnheader">MSRP</span></div>
            {products.map((product) => (
              <div className="line-sheet-row" role="row" key={product.id}>
                <strong role="cell">{product.name}</strong><span role="cell">{product.fit}</span><span role="cell">S-2XL</span><span role="cell">{product.price}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="wholesale-partnership">
          <div><span>03 / Partnership model</span><h2>Built for a considered first order.</h2></div>
          <div className="wholesale-points">
            <article><strong>Capsule first</strong><p>Start with a selective three-style edit and make the retail story clear.</p></article>
            <article><strong>Exclusive potential</strong><p>Retail-specific colorways, artwork, or a focused city capsule can be scoped with the buyer.</p></article>
            <article><strong>Production plan</strong><p>Wholesale pricing, minimums, samples, and delivery dates are confirmed before any purchase order is accepted.</p></article>
          </div>
        </section>

        <section className="wholesale-close">
          <span>Buyer conversation</span>
          <h2>See the work in person.</h2>
          <p>Samples, print details, and a wholesale production plan are available for qualified retail conversations.</p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Start with DE.LA.COSTA</a>
        </section>
      </main>
    </div>
  );
}
