import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import "./storefront.css";

const PARTNER_ENDPOINT = "/api/partner-inquiry";
const INSTAGRAM_URL = "https://www.instagram.com/_de.la.costa_/";
const PARTNER_URL = "https://trststudios.online/partners";

function PartnerSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Partner With TRST",
    url: PARTNER_URL,
    provider: { "@type": "Organization", name: "TRST Studios", url: "https://trststudios.online/" },
    description: "Sponsorship and strategic partnership opportunities with TRST Studios and DE.LA.COSTA.",
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function PartnerADrop() {
  const [form, setForm] = useState({ name: "", email: "", organization: "", interest: "sponsorship", link: "", idea: "", website: "" });
  const [state, setState] = useState({ status: "idle", message: "" });

  useEffect(() => {
    const previousTitle = document.title;
    const canonical = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.href;
    document.title = "Partner With TRST | TRST Studios";
    canonical?.setAttribute("href", PARTNER_URL);
    return () => {
      document.title = previousTitle;
      if (previousCanonical) canonical?.setAttribute("href", previousCanonical);
    };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setState({ status: "loading", message: "" });
    try {
      const response = await fetch(PARTNER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, path: window.location.pathname }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Your request could not be saved. Please try again.");
      track("Partner inquiry submitted", { organization: form.organization || "independent" });
      setState({ status: "success", message: "Your collaboration idea is with the studio." });
      setForm({ name: "", email: "", organization: "", interest: "sponsorship", link: "", idea: "", website: "" });
    } catch (error) {
      setState({ status: "error", message: error.message || "Your request could not be saved. Please try again." });
    }
  }

  return (
    <div className="partner-page">
      <PartnerSchema />
      <a className="skip-link" href="#partner-main">Skip to collaboration details</a>
      <header className="partner-header">
        <a className="wordmark" href="/" aria-label="TRST Studios home"><strong>TRST STUDIOS</strong><small>Partner With TRST</small></a>
        <a className="partner-shop-link" href="/#shop">Shop the collection</a>
      </header>
      <main id="partner-main">
        <section className="partner-hero">
          <span>Partner with TRST</span>
          <h1>Back the story,<br />not just the shirt.</h1>
          <p>TRST Studios makes artist-led apparel, visual stories, and community-facing releases. We partner with organizations and businesses that want to help meaningful culture travel further.</p>
          <a href="#partner-inquiry">Start a conversation</a>
        </section>

        <section className="partner-intro">
          <p>A good partnership is not a logo placement. It creates a real moment: a story people can see, wear, share, and remember.</p>
          <div><span>Built for</span><strong>Community. Culture. Independent business.</strong></div>
        </section>

        <section className="partner-steps" aria-label="How a TRST partnership works">
          <article><span>01</span><h2>Sponsor a story.</h2><p>Underwrite a community portrait, artist release, short film, or public creative moment with a clear and respectful role in the story.</p></article>
          <article><span>02</span><h2>Build the moment.</h2><p>TRST develops the visual direction, launch assets, apparel concept, and a documented activation plan around the work.</p></article>
          <article><span>03</span><h2>Reach real people.</h2><p>Campaigns live through the TRST storefront, social channels, partner networks, and made-to-order releases with no inventory gamble.</p></article>
          <article><span>04</span><h2>Show the result.</h2><p>Partners receive a clear recap of the work, launch activity, and the agreed outcomes for their support.</p></article>
        </section>

        <section className="partner-fit">
          <div><span>Partnership formats</span><h2>More than a logo placement.</h2></div>
          <div className="partner-fit-grid">
            <article><strong>Story sponsor</strong><p>Back an original visual story, release, or local activation with a natural connection to the people involved.</p></article>
            <article><strong>Community partner</strong><p>Support a transparent fundraiser, youth-art moment, or shared release without an inventory commitment.</p></article>
            <article><strong>Event partner</strong><p>Co-create a live activation and a QR-led release that continues after the crowd goes home.</p></article>
            <article><strong>Strategic partner</strong><p>Bring production, distribution, retail, or creative expertise to help turn early demand into durable growth.</p></article>
          </div>
        </section>

        <section className="partner-inquiry" id="partner-inquiry">
          <div><span>Start here</span><h2>What could we build together?</h2><p>Tell us what you want to support, who it serves, and what you bring to the table. We keep the first conversation focused and practical.</p><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Or message DE.LA.COSTA on Instagram</a></div>
          <form onSubmit={submit}>
            <label>Name<input name="name" value={form.name} onChange={updateField} autoComplete="name" required /></label>
            <label>Email<input type="email" name="email" value={form.email} onChange={updateField} autoComplete="email" required /></label>
            <label>Organization, project, or artist name<input name="organization" value={form.organization} onChange={updateField} required /></label>
            <label>How would you like to partner?<select name="interest" value={form.interest} onChange={updateField}><option value="sponsorship">Sponsor a story or activation</option><option value="community">Community partnership</option><option value="event">Event partnership</option><option value="strategic">Strategic production, retail, or distribution partnership</option></select></label>
            <label>Website or social link<input name="link" value={form.link} onChange={updateField} inputMode="url" placeholder="https:// or @handle" /></label>
            <label>Tell us the opportunity<textarea name="idea" value={form.idea} onChange={updateField} rows="5" required /></label>
            <label className="honeypot" aria-hidden="true">Website<input name="website" value={form.website} onChange={updateField} tabIndex="-1" autoComplete="off" /></label>
            <button type="submit" disabled={state.status === "loading"}>{state.status === "loading" ? "Saving..." : "Start the conversation"}</button>
            <small>We use this information only to review this partnership request.</small>
            {state.message ? <p className={state.status} role={state.status === "error" ? "alert" : "status"}>{state.message}</p> : null}
          </form>
        </section>
      </main>
      <footer className="partner-footer"><strong>TRST STUDIOS</strong><a href="/">Return to the collection</a></footer>
    </div>
  );
}
