import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import "./storefront.css";

const SIGNAL_ENDPOINT = "/api/thread-signal";

const chapters = {
  "santa-ana": {
    number: "01",
    city: "Santa Ana",
    region: "California",
    prompt: "Santa Ana gave me...",
    url: "https://trststudios.online/open-thread/santa-ana",
    image: "/instagram/black-and-white.jpg",
    imageAlt: "TRST community gathering outdoors",
    status: "active",
    startDate: "2026-08-01",
    closeDate: "2026-08-14",
    anchor: "Café Cito",
    description: "Our first community archive built from stories shared at OC's oldest mercado.",
  },
  "san-juan-capistrano": {
    number: "02",
    city: "San Juan Capistrano",
    region: "California",
    prompt: "San Juan Capistrano gave me...",
    url: "https://trststudios.online/open-thread/san-juan-capistrano",
    image: "/instagram/cheos-world.jpg",
    imageAlt: "TRST illustrated street scene",
    status: "upcoming",
    startDate: "2026-09-01",
    closeDate: "2026-09-14",
    anchor: "MASA Arts Center",
    description: "Stories of migration, community gardens, and the legacy of the Mission.",
  },
};

const CHAPTER_PRODUCERS = {
  "santa-ana": [
    {
      name: "GCS Clothing",
      role: "Story Steward",
      description: "Streetwear and artist collective anchoring the Santa Ana narrative",
      contribution: "Seed signals and local artist connections",
    },
    {
      name: "Café Cito / Cito Mercadito",
      role: "Physical Anchor",
      description: "OC's public market featuring local makers since 1995",
      contribution: "Story Table hosting at Sunday markets",
    },
  ],
  "san-juan-capistrano": [
    {
      name: "MASA Arts Center",
      role: "Story Steward",
      description: "Community arts hub fostering local creative expression",
      contribution: "Context sessions and exhibition space",
    },
  ],
};

function getUtm() {
  const query = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      .map((key) => [key, query.get(key) || ""])
      .filter(([, value]) => value),
  );
}

function OpenThreadSchema({ chapter }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${chapter.prompt} | TRST Open Thread`,
    url: chapter.url,
    description: `TRST Open Thread is collecting permissioned community signals for ${chapter.city}, California, that will become a public creative record.`,
    isPartOf: { "@type": "WebSite", name: "TRST Studios", url: "https://trststudios.online/" },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function OpenThread({ chapterKey }) {
  const chapter = chapters[chapterKey] || chapters["santa-ana"];
  const [form, setForm] = useState({ signal: "", firstName: "", email: "", permissionToPublish: false, chapterUpdates: false, website: "" });
  const [state, setState] = useState({ status: "idle", message: "" });

  useEffect(() => {
    const previousTitle = document.title;
    const canonical = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.href;
    document.title = `${chapter.prompt} | TRST Open Thread`;
    canonical?.setAttribute("href", chapter.url);
    track("Open Thread chapter viewed", { chapter: chapterKey });
    return () => {
      document.title = previousTitle;
      if (previousCanonical) canonical?.setAttribute("href", previousCanonical);
    };
  }, [chapter, chapterKey]);

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setState({ status: "loading", message: "" });
    try {
      const response = await fetch(SIGNAL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...form,
          chapter: chapterKey,
          prompt: chapter.prompt,
          path: window.location.pathname,
          referrer: document.referrer,
          utm: getUtm(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Your signal could not be saved. Please try again.");
      track("Open Thread signal submitted", { chapter: chapterKey, publishPermission: form.permissionToPublish, updates: form.chapterUpdates });
      setState({ status: "success", message: `Your signal is in the ${chapter.city} thread. Thank you for adding your line.` });
      setForm({ signal: "", firstName: "", email: "", permissionToPublish: false, chapterUpdates: false, website: "" });
    } catch (error) {
      setState({ status: "error", message: error.message || "Your signal could not be saved. Please try again." });
    }
  }

  return (
    <div className="thread-page">
      <OpenThreadSchema chapter={chapter} />
      <a className="skip-link" href="#thread-main">Skip to the chapter prompt</a>
      <header className="thread-header">
        <a className="wordmark" href="/" aria-label="TRST Studios home"><strong>TRST STUDIOS</strong><small>Open Thread</small></a>
        <a className="thread-shop-link" href="/open-thread">All chapters</a>
      </header>
      <main id="thread-main">
        <section className="thread-hero">
          <img className="thread-hero-image" src={chapter.image} alt={chapter.imageAlt} fetchPriority="high" decoding="async" />
          <div>
            <span>Chapter {chapter.number} / {chapter.city}, {chapter.region}</span>
            <h1 className={chapter.city.length > 14 ? "thread-long-title" : ""}>{chapter.prompt.replace("...", "").split(" gave ").map((line, index) => <span key={line}>{index === 0 ? line : `gave ${line}`}</span>)}</h1>
          </div>
          <p>Open Thread is a living record of the places that shape us. Add one line. Help build this chapter.</p>
          <a href="#add-your-line">Add your line</a>
          <strong aria-hidden="true">{chapter.number}</strong>
        </section>

        <section className="thread-manifesto">
          <p>Not a survey. Not a slogan. A shared record of what a city gives its people - carried by the people who know it.</p>
          <div><span>How it works</span><strong>Your line stays private unless you choose to let TRST consider it for a future public creative record.</strong></div>
        </section>

        <section className="thread-steps" aria-label="How Open Thread works">
          <article><span>01</span><h2>Leave a signal.</h2><p>One sentence, one memory, one piece of the place you carry with you.</p></article>
          <article><span>02</span><h2>Build the thread.</h2><p>TRST gathers permissioned signals into a living {chapter.city} composition.</p></article>
          <article><span>03</span><h2>Return it to the city.</h2><p>The chapter becomes a public creative record, then informs a limited TRST artifact.</p></article>
        </section>

        <section className="thread-form-section" id="add-your-line">
          <div className="thread-form-copy">
            <span>{chapter.city}, write back</span>
            <h2>What did this city give you?</h2>
            <p>Finish the sentence in your own words. We will never publish your response, name, or contact information without your clear permission.</p>
            <p className="thread-note">A public chapter is still forming. The first signals are being collected now.</p>
          </div>
          <form className="thread-form" onSubmit={submit}>
            <label>{chapter.prompt}<textarea name="signal" value={form.signal} onChange={updateField} rows="5" maxLength="320" required placeholder="A sentence, memory, or feeling." /></label>
            <p className="thread-counter">{form.signal.length}/320</p>
            <label>First name <small>Optional - only used if you give publication permission.</small><input name="firstName" value={form.firstName} onChange={updateField} autoComplete="given-name" maxLength="80" /></label>
            <label>Email <small>Optional - only for this chapter if you opt in below.</small><input type="email" name="email" value={form.email} onChange={updateField} autoComplete="email" maxLength="254" /></label>
            <label className="thread-check"><input type="checkbox" name="permissionToPublish" checked={form.permissionToPublish} onChange={updateField} /><span>I give TRST permission to consider publishing my response in the {chapter.city} Open Thread. My email will never be published.</span></label>
            <label className="thread-check"><input type="checkbox" name="chapterUpdates" checked={form.chapterUpdates} onChange={updateField} /><span>Send me TRST Dispatch and chapter updates. This is separate from publication permission.</span></label>
            <label className="honeypot" aria-hidden="true">Website<input name="website" value={form.website} onChange={updateField} tabIndex="-1" autoComplete="off" /></label>
            <button type="submit" disabled={state.status === "loading"}>{state.status === "loading" ? "Adding your line..." : "Add to the thread"}</button>
            {state.message ? <p className={state.status} role={state.status === "error" ? "alert" : "status"}>{state.message}</p> : null}
          </form>
        </section>

        <section className="thread-next">
          <div><span>Open Thread is looking for anchors</span><h2>Hold a corner of this chapter.</h2></div>
          <p>{chapter.city} spaces, artists, and community organizations: help us create a small, respectful place for people to add their line.</p>
          <a href="/partners">Become an anchor</a>
        </section>
      </main>
      <footer className="thread-footer"><strong>TRST STUDIOS</strong><a href="/open-thread">View all chapters</a></footer>
    </div>
  );
}
