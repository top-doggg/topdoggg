import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { getPrintifyCheckoutUrl, isPrintifyConfigured } from "./printify";
import "./storefront.css";

const SUBSCRIBE_ENDPOINT = (import.meta.env.VITE_SUBSCRIBE_ENDPOINT || "/api/subscribe").trim();
const POPUP_KEY = "trst-subscriber-popup-v2";
const INSTAGRAM_URL = "https://www.instagram.com/_de.la.costa_/";

const products = [
  {
    id: "bandana-inspired-corner-print",
    name: "Bandana Corner Tee",
    price: "$31.01",
    sizePrices: { "2XL": "$32.26" },
    badge: "Artist Edition",
    story: "Ornamental corner work translated into a clean black tee built for everyday rotation.",
    fit: "Classic unisex fit",
    image: "https://images-api.printify.com/mockup/6a63d7da4442ce52140a4f8d/73207/98445/bandana-inspired-graphic-t-shirt-black-ornamental-corner-print.jpg?camera_label=front&revision=1784930297570",
    backImage: "https://images-api.printify.com/mockup/6a63d7da4442ce52140a4f8d/73207/98446/bandana-inspired-graphic-t-shirt-black-ornamental-corner-print.jpg?camera_label=back&revision=1784930297588",
  },
  {
    id: "raises-en-la-tierra",
    name: "Raíces En La Tierra Tee",
    price: "$31.01",
    sizePrices: { "2XL": "$32.26" },
    badge: "Edition 001",
    story: "A roots-forward graphic about land, ancestry, memory, and carrying home with you.",
    fit: "Classic unisex fit",
    image: "https://images-api.printify.com/mockup/6a63ca59719b931bfe05a193/79018/98445/raises-en-la-tierra-graphic-t-shirt-black-aztec-back-print.jpg?camera_label=front&revision=1784930173914",
    backImage: "https://images-api.printify.com/mockup/6a63ca59719b931bfe05a193/79018/98446/raises-en-la-tierra-graphic-t-shirt-black-aztec-back-print.jpg?camera_label=back&revision=1784930174031",
  },
  {
    id: "tribal-geometry",
    name: "Nahuatl Geometry Tee",
    price: "$31.01",
    sizePrices: { "2XL": "$32.26" },
    badge: "Artist Edition",
    story: "Geometric forms arranged as a balanced chest-and-back artwork system.",
    fit: "Classic unisex fit",
    image: "https://images-api.printify.com/mockup/6a63ad939afcd66a3c07601b/73207/98445/tribal-geometry-t-shirt-nahuatl-inspired-chest-back-graphic.jpg?camera_label=front&revision=1784930066910",
    backImage: "https://images-api.printify.com/mockup/6a63ad939afcd66a3c07601b/73207/98446/tribal-geometry-t-shirt-nahuatl-inspired-chest-back-graphic.jpg?camera_label=back&revision=1784930066928",
  },
  {
    id: "young-boyz",
    name: "Better Together Tee",
    price: "$31.01",
    sizePrices: { "2XL": "$32.26" },
    badge: "Community Piece",
    story: "A crew portrait and community statement centered on connection over isolation.",
    fit: "Classic unisex fit",
    image: "https://images-api.printify.com/mockup/6a6247b039295caab900c2c7/73207/98445/street-crew-graphic-tshirt-better-together-floating-heads-backprint.jpg?camera_label=front&revision=1784930256662",
    backImage: "https://images-api.printify.com/mockup/6a6247b039295caab900c2c7/73207/98446/street-crew-graphic-tshirt-better-together-floating-heads-backprint.jpg?camera_label=back&revision=1784930256687",
  },
  {
    id: "no-bad-days",
    name: "No Bad Days Tee",
    price: "$29.05",
    sizePrices: { "2XL": "$31.06" },
    badge: "Daily Uniform",
    story: "A direct graphic made for everyday wear with a darker hand-drawn edge.",
    fit: "Classic unisex fit",
    image: "https://images-api.printify.com/mockup/6a62444306936faf06051c77/78973/98445/no-bad-days-skull-tee.jpg?camera_label=front&revision=1784929657944",
    backImage: "https://images-api.printify.com/mockup/6a62444306936faf06051c77/78973/98446/no-bad-days-skull-tee.jpg?camera_label=back&revision=1784929657952",
  },
  {
    id: "watching-me-closely",
    name: "Rose From Concrete Boxy Tee",
    price: "$36.15",
    sizePrices: { "2XL": "$36.92" },
    badge: "Studio Cut",
    story: "The rose, the concrete, and the angels—resilience carried across front and back.",
    fit: "Relaxed boxy fit",
    image: "https://pfy-prod-products-mockup-media.s3.us-east-2.amazonaws.com/files/2026/07/20260723153027-1f186ab6-e694-650e-b98a-6e2d9bbeff50.png?revision=1784928763066",
    backImage: "https://pfy-prod-products-mockup-media.s3.us-east-2.amazonaws.com/files/2026/07/20260723153031-1f186ab7-0aaf-6c5e-8a0a-0ae0e1a35098.png?revision=1784928763086",
  },
  {
    id: "sin-miedo",
    name: "Sin Miedo Tee",
    price: "$29.45",
    sizePrices: { "2XL": "$31.80" },
    badge: "Edition 001",
    story: "A fearless street-art statement made to carry the message without explanation.",
    fit: "Classic unisex fit",
    image: "https://images-api.printify.com/mockup/6a5eeeab91d18ea0270d1d03/12100/92570/sin-miedo-graphic-tee-urban-street-art-t-shirt.jpg?camera_label=front&revision=1784929988524",
    backImage: "https://images-api.printify.com/mockup/6a5eeeab91d18ea0270d1d03/12100/92571/sin-miedo-graphic-tee-urban-street-art-t-shirt.jpg?camera_label=back&revision=1784929988558",
  },
];

const journal = [
  {
    kicker: "Home rhythm",
    title: "Coming Back Home",
    copy: "No matter where the work travels, the story keeps returning to the people and places that formed it.",
    image: "/instagram/coming-back-home.jpg",
    href: "https://www.instagram.com/_de.la.costa_/p/DVC3Li9jL7a/",
  },
  {
    kicker: "Community memory",
    title: "Old Town Boogie",
    copy: "Live printing, music, painting, and a public response built through community and truth.",
    image: "/instagram/old-town-boogie.jpg",
    href: "https://www.instagram.com/_de.la.costa_/reel/DQlHUW7kcuP/",
  },
  {
    kicker: "Street notes",
    title: "The Realest Feeling",
    copy: "A release rooted in local pickup, direct connection, and the energy behind the work.",
    image: "/instagram/realest-feeling.jpg",
    href: "https://www.instagram.com/_de.la.costa_/p/DOO5-YwEmlE/",
  },
];

const sizes = ["S", "M", "L", "XL", "2XL"];

function priceFor(product, size) {
  return product.sizePrices?.[size] || product.price;
}

function trackStorefront(name, properties = {}) {
  try {
    track(name, properties);
  } catch {
    // Analytics should never block shopping or navigation.
  }
}

async function subscribe(email, website = "") {
  const response = await fetch(SUBSCRIBE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      email,
      website,
      source: "trststudios.online",
      path: window.location.pathname,
    }),
  });

  if (!response.ok) {
    throw new Error("Signup could not be saved. Please try again.");
  }
}

function ProductCard({ product, onOpen }) {
  return (
    <article className="product-card">
      <button type="button" className="product-media" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
        <img className="product-front" src={product.image} alt={`${product.name}, front view`} loading="lazy" decoding="async" />
        <img className="product-back" src={product.backImage} alt={`${product.name}, back view`} loading="lazy" decoding="async" />
        <span>Quick view</span>
      </button>
      <div className="product-copy">
        <div>
          <small>{product.badge}</small>
          <h3>{product.name}</h3>
        </div>
        <strong>From {product.price}</strong>
      </div>
    </article>
  );
}

function ProductModal({ product, onClose }) {
  const [view, setView] = useState("front");
  const [size, setSize] = useState("M");
  const [storeState, setStoreState] = useState({ loading: false, error: "" });

  useEffect(() => {
    setView("front");
    setSize("M");
    setStoreState({ loading: false, error: "" });
  }, [product]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  async function openStore() {
    setStoreState({ loading: true, error: "" });
    try {
      const url = getPrintifyCheckoutUrl([{ id: product.id, size }]);
      trackStorefront("Product checkout", { product: product.id, size });
      window.open(url, "_blank", "noopener,noreferrer");
      setStoreState({ loading: false, error: "" });
    } catch (error) {
      setStoreState({ loading: false, error: error.message || "The secure store is unavailable." });
    }
  }

  return (
    <div className="modal-shell" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="product-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close product details">Close</button>
        <div className="product-gallery">
          <img src={view === "front" ? product.image : product.backImage} alt={`${product.name}, ${view} view`} />
          <div className="gallery-controls" aria-label="Product views">
            <button className={view === "front" ? "active" : ""} type="button" onClick={() => setView("front")}>Front</button>
            <button className={view === "back" ? "active" : ""} type="button" onClick={() => setView("back")}>Back</button>
          </div>
        </div>
        <div className="product-details">
          <span>{product.badge} / DE.LA.COSTA</span>
          <h2 id="product-title">{product.name}</h2>
          <p className="product-story">{product.story}</p>

          <div className="detail-grid">
            <div><small>Fit</small><strong>{product.fit}</strong></div>
            <div><small>Production</small><strong>Made after you order</strong></div>
            <div><small>Care</small><strong>Wash cold, inside out</strong></div>
            <div><small>Checkout</small><strong>Securely through Printify</strong></div>
          </div>

          <fieldset className="size-picker">
            <legend>Choose size</legend>
            <div>
              {sizes.map((item) => (
                <button className={size === item ? "active" : ""} type="button" key={item} onClick={() => setSize(item)}>
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="checkout-row">
            <div><small>Selected</small><strong>{size} / {priceFor(product, size)}</strong></div>
            <button type="button" onClick={openStore} disabled={storeState.loading || !isPrintifyConfigured()}>
              {storeState.loading ? "Opening store…" : "View in secure store"}
            </button>
          </div>

          {!isPrintifyConfigured() ? <p className="store-message">The Printify storefront URL still needs to be configured.</p> : null}
          {storeState.error ? <p className="store-message error" role="alert">{storeState.error}</p> : null}
          <small className="checkout-note">Final size details, quantity, shipping, taxes, and payment are confirmed on Printify.</small>
        </div>
      </section>
    </div>
  );
}

function SubscribeForm({ compact = false, onSuccess }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setState({ status: "error", message: "Enter a valid email address." });
      return;
    }

    setState({ status: "loading", message: "" });
    try {
      await subscribe(email.trim(), website);
      localStorage.setItem(POPUP_KEY, JSON.stringify({ subscribedAt: Date.now() }));
      trackStorefront("Newsletter signup", { placement: compact ? "popup" : "page" });
      setState({ status: "success", message: "You’re on the list." });
      setEmail("");
      onSuccess?.();
    } catch (error) {
      setState({ status: "error", message: error.message || "Signup failed." });
    }
  }

  return (
    <form className={`subscribe-form ${compact ? "compact" : ""}`} onSubmit={handleSubmit}>
      <label>
        <span>Email address</span>
        <input type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex="-1" autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
      </label>
      <button type="submit" disabled={state.status === "loading"}>{state.status === "loading" ? "Joining…" : "Join the list"}</button>
      {state.message ? <small className={state.status} role={state.status === "error" ? "alert" : "status"}>{state.message}</small> : null}
    </form>
  );
}

function SubscriberPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(POPUP_KEY);
    if (stored) return undefined;
    const timer = window.setTimeout(() => setOpen(true), 35000);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(POPUP_KEY, JSON.stringify({ dismissedAt: Date.now() }));
    setOpen(false);
  }

  if (!open) return null;

  return (
    <aside className="subscriber-popup" aria-label="TRST Studios mailing list">
      <button type="button" className="popup-close" onClick={dismiss} aria-label="Dismiss signup">×</button>
      <span>TRST Dispatch</span>
      <h2>Get the next drop before the feed does.</h2>
      <p>Limited apparel, print releases, and studio stories—sent only when there is something worth opening.</p>
      <SubscribeForm compact onSuccess={() => window.setTimeout(() => setOpen(false), 900)} />
    </aside>
  );
}

export default function Storefront() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const featuredProducts = useMemo(() => products, []);

  function openProduct(product) {
    setActiveProduct(product);
    trackStorefront("Product quick view", { product: product.id });
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="trst-site">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="announcement">Edition 001 is live · Independent art and apparel</div>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="TRST Studios home" onClick={closeMenu}>
          <strong>TRST STUDIOS</strong>
          <small>DE.LA.COSTA / Edition 001</small>
        </a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-nav" onClick={() => setMenuOpen((current) => !current)}>
          {menuOpen ? "Close" : "Menu"}
        </button>
        <nav id="primary-nav" className={menuOpen ? "open" : ""} aria-label="Primary navigation">
          <a href="#shop" onClick={closeMenu}>Shop</a>
          <a href="#story" onClick={closeMenu}>Our Story</a>
          <a href="#journal" onClick={closeMenu}>Journal</a>
          <a href="#customer-care" onClick={closeMenu}>Customer Care</a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackStorefront("Instagram outbound", { placement: "header" })}>Instagram</a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <img src="/instagram/realest-feeling.jpg" alt="TRST Studios DE.LA.COSTA campaign artwork" fetchPriority="high" decoding="async" />
          <div className="hero-shade" />
          <div className="hero-copy">
            <span>TRST Studios presents DE.LA.COSTA</span>
            <h1>Art from the block. Built to be worn.</h1>
            <p>Independent apparel and visual stories rooted in community, memory, and the places that shape us.</p>
            <div className="hero-actions">
              <a className="button light" href="#shop" onClick={() => trackStorefront("Hero shop click")}>Shop Edition 001</a>
              <a className="button outline" href="#story">Discover the story</a>
            </div>
          </div>
          <div className="hero-edition" aria-hidden="true">001</div>
        </section>

        <section className="trust-strip" aria-label="Store benefits">
          <span>Independent artist</span>
          <span>Made after order</span>
          <span>Secure Printify checkout</span>
          <span>Limited edition work</span>
        </section>

        <section className="shop-section" id="shop">
          <header className="section-heading">
            <div><span>Edition 001</span><h2>Wear the archive.</h2></div>
            <p>Original artwork translated into pieces built around community, cultural memory, and everyday resilience.</p>
          </header>
          <div className="product-grid">
            {featuredProducts.map((product) => <ProductCard key={product.id} product={product} onOpen={openProduct} />)}
          </div>
        </section>

        <section className="story-section" id="story">
          <div className="story-image"><img src="/instagram/coming-back-home.jpg" alt="DE.LA.COSTA visual story about returning home" loading="lazy" decoding="async" /></div>
          <div className="story-copy">
            <span>Our story</span>
            <h2>The work starts with place.</h2>
            <p>TRST Studios is an independent platform for art, apparel, and visual storytelling. DE.LA.COSTA / Edition 001 carries the first public chapter: images shaped by urban life, cultural identity, community memory, strength, vulnerability, and the emotional weight inside everyday moments.</p>
            <p>The goal is not to flatten the culture into a trend. It is to create work with enough care that the people, symbols, and places behind it remain visible.</p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Follow the living archive</a>
          </div>
        </section>

        <section className="journal-section" id="journal">
          <header className="section-heading">
            <div><span>Journal</span><h2>Stories behind the work.</h2></div>
            <p>Notes from the studio, the street, and the people carrying the story forward.</p>
          </header>
          <div className="journal-grid">
            {journal.map((item) => (
              <article className="journal-card" key={item.title}>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
                </a>
                <span>{item.kicker}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <a href={item.href} target="_blank" rel="noopener noreferrer">Read on Instagram</a>
              </article>
            ))}
          </div>
        </section>

        <section className="care-section" id="customer-care">
          <article><span>Shipping</span><h3>Made after you order.</h3><p>Production and estimated delivery are shown in the secure store before payment.</p></article>
          <article><span>Sizing</span><h3>Check the final measurements.</h3><p>Use the garment measurements on the Printify product page before choosing your size.</p></article>
          <article><span>Returns</span><h3>Review before checkout.</h3><p>Replacement and return terms are displayed by the fulfillment store before purchase.</p></article>
          <article><span>Support</span><h3>Talk to the studio.</h3><p><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Message DE.LA.COSTA on Instagram</a> with product or order questions.</p></article>
        </section>

        <section className="newsletter-section">
          <span>TRST Dispatch</span>
          <h2>First access to limited drops, print releases, and studio stories.</h2>
          <p>No daily noise. Just releases, meaningful updates, and the work behind them.</p>
          <SubscribeForm />
        </section>
      </main>

      <footer className="site-footer">
        <div><strong>TRST STUDIOS</strong><span>Independent art, apparel, and visual storytelling.</span></div>
        <nav aria-label="Footer navigation">
          <a href="#shop">Shop</a><a href="#story">Our Story</a><a href="#journal">Journal</a><a href="#customer-care">Customer Care</a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>
        </nav>
        <small>DE.LA.COSTA / Edition 001 · Pride In My Community</small>
      </footer>

      {activeProduct ? <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} /> : null}
      <SubscriberPopup />
    </div>
  );
}
