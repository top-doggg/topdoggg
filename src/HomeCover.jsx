import { useState } from "react";
import SiteShell from "./app/SiteShell.jsx";
import { trackDiscoveryEvent } from "./lib/discovery-telemetry.js";
import "./home-cover.css";

const SUBSCRIBE_ENDPOINT = (import.meta.env.VITE_SUBSCRIBE_ENDPOINT || "/api/subscribe").trim();
const paths = [
  { number: "01", intent: "Shop", title: "Shop Edition 001", copy: "Current artist editions and wearable work.", href: "/shop" },
  { number: "02", intent: "Collect", title: "Collect or license", copy: "Original work, editions, exhibitions, and licensing.", href: "/shop#available-work" },
  { number: "03", intent: "Collaborate", title: "Bring a project", copy: "Commissions, partnerships, and public creative work.", href: "/partners" },
  { number: "04", intent: "Participate", title: "Enter Open Thread", copy: "Add your voice to the community archive.", href: "/open-thread" },
];

export default function HomeCover() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function subscribe(event) {
    event.preventDefault();
    setStatus("Joining…");
    try {
      const response = await fetch(SUBSCRIBE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "home-cover", placement: "dispatch", path: "/" }),
      });
      if (!response.ok) throw new Error();
      setEmail("");
      setStatus("You're on the list.");
    } catch {
      setStatus("Please try again.");
    }
  }

  function trackIntent(intent) {
    trackDiscoveryEvent("Homepage intent selected", { intent });
  }

  return (
    <SiteShell mainId="home-main">
      <main id="home-main" className="cover-home">
        <section className="cover-hero">
          <img
            src="/instagram/coming-back-home.jpg"
            alt="Coming Back Home, a DE.LA.COSTA collage of Southern California street scenes"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <div>
            <span>Artist studio / editions / collaborations</span>
            <h1>Art, memory, place, and the people who carry it.</h1>
            <p>DE.LA.COSTA is the visual practice of Jorge S. Ruiz. TRST Studios is the platform for editions, original work, partnerships, and Open Thread.</p>
            <div className="cover-hero-actions">
              <a href="/shop" onClick={() => trackIntent("shop")}>Shop Edition 001</a>
              <a className="cover-hero-secondary" href="/work" onClick={() => trackIntent("work")}>Explore the work</a>
            </div>
          </div>
        </section>
        <section className="cover-paths" aria-label="Choose what you want to do">
          {paths.map((path) => (
            <a href={path.href} key={path.title} className={path.intent === "Shop" ? "cover-path-primary" : ""} onClick={() => trackIntent(path.intent.toLowerCase())}>
              <small>{path.number} / {path.intent}</small>
              <strong>{path.title}</strong>
              <span>{path.copy}</span>
              <b aria-hidden="true">→</b>
            </a>
          ))}
        </section>
        <section className="cover-proof" aria-label="What to expect from TRST">
          <span>What to expect</span>
          <strong>Independent artist</strong>
          <strong>Made after order</strong>
          <strong>Secure Printify checkout</strong>
          <strong>Studio inquiries welcome</strong>
        </section>
        <section className="cover-feature">
          <img
            src="/api/homepage-image?key=grace"
            alt="Full of Grace, a DE.LA.COSTA visual work"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <div>
            <span>Featured project</span>
            <h2>West of the Tracks</h2>
            <p>A continuing visual archive of community, memory, belonging, and everyday life in Southern California.</p>
            <a href="/work/west-of-the-tracks">Enter the project</a>
          </div>
        </section>
        <section className="cover-feature">
          <img src="/portfolio/never-alone-artwork.webp" alt="Never Alone illustration of five people with their arms around one another" loading="lazy" decoding="async" style={{ objectFit: "contain" }} />
          <div><span>Portfolio &amp; process</span><h2>Work. In the making.</h2><p>A closer look at sketches, color studies, photography, and the images they become.</p><a href="/process">Explore the process</a></div>
        </section>
        <section className="cover-dispatch">
          <div>
            <span>TRST Dispatch</span>
            <h2>New work, field notes, releases, and opportunities.</h2>
          </div>
          <form onSubmit={subscribe}>
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
            <button type="submit">Join Dispatch</button>
            {status && <small role="status">{status}</small>}
          </form>
        </section>
      </main>
    </SiteShell>
  );
}
