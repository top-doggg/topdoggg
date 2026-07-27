import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { getPrintifyCheckoutUrl, isPrintifyConfigured } from "./printify";

const draftStorageKey = "de-la-costa-builder-draft-v1";
const issueStorageKey = "de-la-costa-zine-issues-v1";
const cartStorageKey = "de-la-costa-cart-v1";
const subscriberStorageKey = "de-la-costa-subscriber-popup-v1";
const forgeStorageKey = "de-la-costa-site-forge-v1";

const starterProfile = {
  name: "Co.Keys",
  handle: "@_de.la.costa_",
  bio: "Pride In My Community",
  posts: "59",
  followers: "1,769",
  following: "1,348",
  linkedAccount: "@westofthetracks",
  headline: "De.La.Costa is a living archive for the town, the tracks, and the people carrying the story.",
  intro:
    "A moving site generated from the public Instagram profile: images, captions, highlights, links, counts, and recurring tags.",
};

const starterHighlights = [
  {
    title: "Mix Media",
    type: "Highlight",
    href: "https://www.instagram.com/stories/highlights/18110597768093853/",
    note: "A public profile highlight for mixed-media work.",
    image: "/instagram/highlight-mix-media.jpg",
  },
  {
    title: "Digital zine",
    type: "Highlight",
    href: "https://www.instagram.com/stories/highlights/18057541159869532/",
    note: "A public profile highlight for zine-style publishing.",
    image: "/instagram/highlight-digital-zine.jpg",
  },
  {
    title: "@westofthetracks",
    type: "Linked account",
    href: "https://www.instagram.com/westofthetracks/",
    note: "Linked from the public Instagram profile bio.",
    image: "/instagram/profile.jpg",
  },
];

const starterItems = [
  ["post", "GAME RECOGNIZES GAME.", "A public grid post with the compact line: GAME RECOGNIZES GAME.", "https://www.instagram.com/_de.la.costa_/p/DQNVpALEjdV/", ["recent post", "respect", "community"], "Street notes", "direct", "/instagram/game-recognizes-game.jpg"],
  ["reel", "The SET?", "The Special Enforcement Team is described in the caption, followed by: Seems like a gang to me.", "https://www.instagram.com/_de.la.costa_/reel/DaJ3P_hI1sY/", ["community", "public record", "WestOfTheTracks"], "Civic memory", "critical", "/instagram/set.jpg"],
  ["reel", "CHEOSxWORLD", "Caption tags include CapistranoLove, WestOfTheTracks, LONGLIVECHEOxCHURRO, and illustration.", "https://www.instagram.com/_de.la.costa_/reel/DYIbb4RSg15/", ["CapistranoLove", "illustration", "WestOfTheTracks"], "Visual language", "tribute", "/instagram/cheos-world.jpg"],
  ["reel", "Sunday morning", "Sunday morning, I give the lord praise. Tagged 4thetown, CapistranoLove, WestOfTheTracks, community, and orangecounty.", "https://www.instagram.com/_de.la.costa_/reel/DXUv9W9Dwij/", ["4thetown", "CapistranoLove", "orangecounty"], "Home rhythm", "quiet", "/instagram/sunday-morning.jpg"],
  ["post", "Coming back home", "No matter where I am, no matter what I do, I am always coming back home to you.", "https://www.instagram.com/_de.la.costa_/p/DVC3Li9jL7a/", ["CapistranoLove", "home", "reflection"], "Home rhythm", "devotional", "/instagram/coming-back-home.jpg"],
  ["post", "A moment to myself", "Had a moment to myself today. No research, no writing, no having to defend myself.", "https://www.instagram.com/_de.la.costa_/p/DTNDYYflDGD/", ["reflection", "quiet", "personal"], "Street notes", "still", "/instagram/moment-to-myself.jpg"],
  ["reel", "FREETHEREAL X CHASETHATBAG", "Caption tags include CapistranoLove, forthetown, westofthetracks, freethereal, and cheosworld.", "https://www.instagram.com/_de.la.costa_/reel/DRilTZHj-f8/", ["forthetown", "cheosworld", "WestOfTheTracks"], "Visual language", "collab", "/instagram/freethereal.jpg"],
  ["reel", "Old Town Boogie 2", "A public caption about live screen printing, music, painting, and responding with community, music, and truth.", "https://www.instagram.com/_de.la.costa_/reel/DQlHUW7kcuP/", ["event", "music", "truth"], "Civic memory", "active", "/instagram/old-town-boogie.jpg"],
  ["reel", "Yeah, aight", "Yeah, aight! What I say. Tags include longlivecxc, capistranolove, and community.", "https://www.instagram.com/_de.la.costa_/reel/DPHSJVcD69S/", ["community", "longlivecxc", "CapistranoLove"], "Street notes", "spoken", "/instagram/yeah-aight.jpg"],
  ["post", "Black and white", "I saw the world in black and white instead of the vibrant colours and shades I knew existed.", "https://www.instagram.com/_de.la.costa_/p/DOmPeemkuXb/", ["CapistranoLove", "reflection", "color"], "Visual language", "reflective", "/instagram/black-and-white.jpg"],
  ["post", "The Realest Feeling", "The Realest Feeling. Shirts available for pick up at Carwash. Tag: LONGLIVECXC.", "https://www.instagram.com/_de.la.costa_/p/DOO5-YwEmlE/", ["shirts", "LONGLIVECXC", "pickup"], "Street notes", "release", "/instagram/realest-feeling.jpg"],
  ["post", "Value of everything", "In knowing nothing, I discovered the value of everything. Tagged @_de.la.costa_.", "https://www.instagram.com/_de.la.costa_/p/DNHv28BOTWT/", ["reflection", "value", "De.La.Costa"], "Home rhythm", "open", "/instagram/value-of-everything.jpg"],
].map(([type, title, caption, href, tags, series, mood, image]) => ({
  type,
  title,
  caption,
  href,
  tags,
  series,
  mood,
  image,
}));

const themes = {
  zine: {
    label: "Street Zine",
    className: "theme-zine",
  },
  night: {
    label: "Night Archive",
    className: "theme-night",
  },
  gallery: {
    label: "Clean Gallery",
    className: "theme-gallery",
  },
};

const remixPresets = [
  {
    name: "Block Party",
    theme: "zine",
    layout: "poster",
    density: "2",
    featuredIndex: 7,
    sections: {
      highlights: true,
      archive: true,
      motion: true,
      mediaWall: true,
      notes: true,
      json: false,
    },
  },
  {
    name: "Night Archive",
    theme: "night",
    layout: "split",
    density: "1",
    featuredIndex: 4,
    sections: {
      highlights: false,
      archive: true,
      motion: true,
      mediaWall: true,
      notes: true,
      json: false,
    },
  },
  {
    name: "Clean Portfolio",
    theme: "gallery",
    layout: "stack",
    density: "0",
    featuredIndex: 0,
    sections: {
      highlights: true,
      archive: true,
      motion: false,
      mediaWall: true,
      notes: false,
      json: false,
    },
  },
  {
    name: "Civic Memory",
    theme: "night",
    layout: "poster",
    density: "1",
    featuredIndex: 1,
    sections: {
      highlights: true,
      archive: true,
      motion: true,
      mediaWall: false,
      notes: true,
      json: true,
    },
  },
  {
    name: "Home Rhythm",
    theme: "zine",
    layout: "split",
    density: "2",
    featuredIndex: 3,
    sections: {
      highlights: true,
      archive: false,
      motion: true,
      mediaWall: true,
      notes: true,
      json: false,
    },
  },
];

const sectionLabels = {
  highlights: "Highlights",
  archive: "Archive",
  motion: "Motion Rail",
  mediaWall: "Media Wall",
  notes: "Community Notes",
  json: "Site Data",
};

const zinePresets = {
  mini: {
    label: "Mini Zine",
    pageCount: 8,
    size: "5.5 x 8.5 in",
    trim: "Saddle stitch",
    description: "Pocket-sized, fast to print, good for a first issue.",
  },
  magazine: {
    label: "Magazine Issue",
    pageCount: 12,
    size: "8.5 x 11 in",
    trim: "Full sheet",
    description: "Bigger editorial spreads with stronger image presence.",
  },
  poster: {
    label: "Poster Issue",
    pageCount: 4,
    size: "11 x 17 in",
    trim: "Folded poster",
    description: "A short issue that opens into a printable collage.",
  },
};

const pageTemplates = [
  {
    key: "cover",
    label: "Cover",
    className: "template-cover",
  },
  {
    key: "full",
    label: "Full Bleed",
    className: "template-full",
  },
  {
    key: "split",
    label: "Split Caption",
    className: "template-split",
  },
  {
    key: "grid",
    label: "Contact Sheet",
    className: "template-grid",
  },
];


const subscribeEndpoint = (import.meta.env.VITE_SUBSCRIBE_ENDPOINT || "/api/subscribe").trim();

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

async function getSubscriberStatus() {
  const response = await fetch(subscribeEndpoint, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    return { configured: false };
  }

  return response.json();
}

async function submitSubscriber(email, website) {
  const response = await fetch(subscribeEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      website,
      source: "trststudios.online",
      path: typeof window === "undefined" ? "" : window.location.pathname,
    }),
  });

  if (!response.ok) {
    throw new Error("Subscriber signup could not be saved.");
  }
}

const forgeEndpoint = (import.meta.env.VITE_FORGE_ENDPOINT || "/api/site-blueprints").trim();

const forgePlans = [
  {
    id: "starter-care",
    name: "Starter Care",
    price: "$29/mo",
    tagline: "One sharp website blueprint, hosted launch support, and light monthly upkeep.",
    fit: "solo brands, artists, small shops",
  },
  {
    id: "growth-care",
    name: "Growth Care",
    price: "$59/mo",
    tagline: "Blueprint, managed updates, lead capture, analytics review, and seasonal refreshes.",
    fit: "active brands and service businesses",
  },
  {
    id: "studio-care",
    name: "Studio Care",
    price: "$99/mo",
    tagline: "Priority builds, monthly campaign pages, product drops, and hands-on creative direction.",
    fit: "shops, creators, and teams with frequent launches",
  },
];

const forgeDefaults = {
  mode: "prompt",
  plan: "starter-care",
  instagram: "",
  facebook: "",
  clientName: "",
  email: "",
  websiteType: "brand site",
  audience: "people who care about story, product, and culture",
  styleWords: "editorial, bold, street archive, premium, human",
  prompt: "",
  files: [],
};

function splitForgeWords(value, fallback = []) {
  const words = String(value || "")
    .split(/[,\n]/)
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 8);

  return words.length ? words : fallback;
}

function buildForgeBlueprint(form) {
  const styleWords = splitForgeWords(form.styleWords, ["bold", "editorial", "clean"]);
  const coreIdea = String(form.prompt || "").trim() || "Build a focused website from the client story and visual references.";
  const assetCount = Array.isArray(form.files) ? form.files.length : 0;
  const sourceSummary = [
    form.instagram ? `Instagram: ${form.instagram}` : "",
    form.facebook ? `Facebook: ${form.facebook}` : "",
    assetCount ? `${assetCount} uploaded inspiration file${assetCount === 1 ? "" : "s"}` : "",
  ].filter(Boolean);

  const selectedPlan = forgePlans.find((plan) => plan.id === form.plan) || forgePlans[0];

  return {
    name: "TRST Site Forge blueprint",
    version: "0.2",
    servicePlan: selectedPlan,
    clientName: String(form.clientName || "").trim().slice(0, 120),
    contactEmail: String(form.email || "").trim().slice(0, 160),
    websiteType: form.websiteType || "brand site",
    audience: form.audience || forgeDefaults.audience,
    styleWords,
    sourceSummary: sourceSummary.length ? sourceSummary : ["Prompt-only intake"],
    creativeDirection: [
      "Lead with the client's strongest visual identity in the first screen.",
      "Turn raw photos and captions into a clear story system before designing pages.",
      "Keep the build shoppable, publishable, and easy to revise.",
    ],
    pages: [
      { title: "Home", role: "First impression, offer, story signal, and primary action." },
      { title: "Story", role: "Client background, tone, values, and visual language." },
      { title: "Work / Shop", role: "Gallery, products, services, or drops depending on the client goal." },
      { title: "Contact / Lead", role: "Email capture, inquiry form, and next-step conversion." },
    ],
    buildSteps: [
      "Collect social/profile references or uploaded images.",
      "Extract palette, typography mood, recurring subjects, captions, and audience intent.",
      "Generate a section-by-section website brief.",
      "Create the Bun/Vite build with reusable components and optimized assets.",
      "Collect monthly care approval before recurring billing is activated.",
      "Run build checks, review the preview, and publish through Vercel.",
    ],
    safetyChecks: [
      "Keep social tokens server-side only once OAuth is added.",
      "Store uploads and blueprint files privately by default.",
      "Require human approval before publishing a generated site or connecting a domain.",
    ],
    prompt: coreIdea.slice(0, 1400),
  };
}

async function saveForgeBlueprint(payload) {
  const response = await fetch(forgeEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      ...payload,
      source: "trststudios.online",
      path: typeof window === "undefined" ? "" : window.location.pathname,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Site blueprint could not be saved.");
  }

  return result;
}


function SiteForge() {
  const stored = readStoredJson(forgeStorageKey, null);
  const [form, setForm] = useState(() => ({ ...forgeDefaults, ...(stored?.form || {}) }));
  const [blueprint, setBlueprint] = useState(() => stored?.blueprint || buildForgeBlueprint({ ...forgeDefaults, ...(stored?.form || {}) }));
  const [saveState, setSaveState] = useState("idle");
  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleFiles(event) {
    const files = Array.from(event.target.files || []).slice(0, 8).map((file) => ({
      name: file.name,
      type: file.type || "unknown",
      size: file.size,
      lastModified: file.lastModified,
    }));
    setForm((current) => ({ ...current, files }));
  }

  function generateBlueprint(event) {
    event.preventDefault();
    const nextBlueprint = buildForgeBlueprint(form);
    setBlueprint(nextBlueprint);
    writeStoredJson(forgeStorageKey, { form, blueprint: nextBlueprint, updatedAt: new Date().toISOString() });
    setSaveState("idle");
    setMessage("Blueprint staged. Save it when it feels ready.");
  }

  async function handleSave() {
    setSaveState("loading");
    setMessage("");

    try {
      const result = await saveForgeBlueprint({ ...form, blueprint });
      writeStoredJson(forgeStorageKey, { form, blueprint, id: result.id, savedAt: new Date().toISOString() });
      setSaveState("success");
      setMessage(`Blueprint saved: ${result.id}`);
    } catch (error) {
      setSaveState("error");
      setMessage(error.message || "Site blueprint could not be saved.");
    }
  }

  const modeCopy = {
    prompt: "Prompt first",
    social: "Social source",
    upload: "Image source",
  };

  const acquisitionSteps = [
    ["01", "Capture", "A style-led landing page, short social posts, and referral links bring prospects into one clean intake."],
    ["02", "Blueprint", "The client sees a concrete site plan before build time is wasted."],
    ["03", "Convert", "Monthly care plans turn one-off builds into a simple recurring service."],
  ];

  const retentionLoops = ["Monthly refresh", "Lead form check", "Analytics note", "Campaign page", "Product drop support"];

  return (
    <section className="forge-section forge-section-v2" id="forge">
      <div className="forge-intro forge-hero-panel">
        <span>TRST Site Forge</span>
        <h2>Upload the vibe. Approve the blueprint. Launch the site.</h2>
        <p>
          A monthly creative website service for small brands, artists, shops, and local businesses that need taste, speed, and care after launch.
        </p>
        <div className="forge-hero-actions">
          <a className="button primary" href="#forge-intake">Start a blueprint</a>
          <a className="button secondary" href="#forge-plans">View plans</a>
        </div>
        <div className="forge-proof forge-proof-v2">
          <strong><span>48hr</span> first blueprint</strong>
          <strong><span>Bun</span> fast builds</strong>
          <strong><span>Care</span> monthly updates</strong>
        </div>
      </div>

      <div className="forge-workspace forge-workspace-v2">
        <div className="forge-plans" id="forge-plans" aria-label="Monthly service plans">
          {forgePlans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className={form.plan === plan.id ? "active" : ""}
              onClick={() => updateField("plan", plan.id)}
            >
              <span>{plan.name}</span>
              <strong>{plan.price}</strong>
              <small>{plan.tagline}</small>
              <em>{plan.fit}</em>
            </button>
          ))}
        </div>

        <div className="forge-sales-flow" aria-label="Client acquisition flow">
          {acquisitionSteps.map(([number, title, copy]) => (
            <article key={title}>
              <span>{number}</span>
              <strong>{title}</strong>
              <p>{copy}</p>
            </article>
          ))}
        </div>

        <div className="forge-retention-band" aria-label="Client retention system">
          <strong>Retention loop</strong>
          <div>
            {retentionLoops.map((loop) => <span key={loop}>{loop}</span>)}
          </div>
        </div>

        <form className="forge-form" id="forge-intake" onSubmit={generateBlueprint}>
          <div className="forge-mode-grid" aria-label="Source mode">
            {Object.entries(modeCopy).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={form.mode === key ? "active" : ""}
                onClick={() => updateField("mode", key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="forge-row">
            <label>
              Client / brand
              <input value={form.clientName} onChange={(event) => updateField("clientName", event.target.value)} placeholder="business or project name" />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="client email" />
            </label>
          </div>

          <div className="forge-row">
            <label>
              Instagram
              <input value={form.instagram} onChange={(event) => updateField("instagram", event.target.value)} placeholder="@brand or profile URL" />
            </label>
            <label>
              Facebook
              <input value={form.facebook} onChange={(event) => updateField("facebook", event.target.value)} placeholder="Page URL" />
            </label>
          </div>

          <div className="forge-row">
            <label>
              Website type
              <input value={form.websiteType} onChange={(event) => updateField("websiteType", event.target.value)} placeholder="brand, shop, portfolio" />
            </label>
            <label>
              Audience
              <input value={form.audience} onChange={(event) => updateField("audience", event.target.value)} placeholder="who the site is for" />
            </label>
          </div>

          <label>
            Style words
            <input value={form.styleWords} onChange={(event) => updateField("styleWords", event.target.value)} placeholder="editorial, warm, luxury, street" />
          </label>

          <label>
            Website idea
            <textarea value={form.prompt} onChange={(event) => updateField("prompt", event.target.value)} placeholder="Describe the client, what they offer, the feeling, and the outcome they want." />
          </label>

          <label className="forge-file">
            Inspiration images
            <input type="file" accept="image/*" multiple onChange={handleFiles} />
            <span>{form.files.length ? `${form.files.length} file${form.files.length === 1 ? "" : "s"} selected` : "Add mood, product, brand, or social screenshots"}</span>
          </label>

          <div className="forge-actions">
            <button className="button primary" type="submit">Generate blueprint</button>
            <button className="button secondary" type="button" onClick={handleSave} disabled={saveState === "loading" || !blueprint}>
              {saveState === "loading" ? "Saving" : "Save intake"}
            </button>
          </div>
          <small className="forge-trust-note">No public launch or billing activation happens until the blueprint is reviewed and approved.</small>
          {message ? <p className={`forge-message ${saveState}`}>{message}</p> : null}
        </form>

        <aside className="forge-preview" aria-label="Generated website blueprint preview">
          <span>{blueprint.websiteType}</span>
          <h3>{blueprint.name}</h3>
          <div className="forge-selected-plan">
            <strong>{blueprint.servicePlan.name}</strong>
            <b>{blueprint.servicePlan.price}</b>
            <small>{blueprint.servicePlan.tagline}</small>
          </div>
          <p>{blueprint.prompt}</p>
          <div className="forge-chip-row">
            {blueprint.styleWords.map((word) => <b key={word}>{word}</b>)}
          </div>
          <div className="forge-columns">
            <div>
              <strong>Sources</strong>
              {blueprint.sourceSummary.map((item) => <small key={item}>{item}</small>)}
            </div>
            <div>
              <strong>Pages</strong>
              {blueprint.pages.map((page) => <small key={page.title}>{page.title}</small>)}
            </div>
          </div>
          <ol className="forge-steps">
            {blueprint.buildSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </aside>
      </div>
    </section>
  );
}

function SubscriberPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!subscribeEndpoint || typeof window === "undefined") {
      return undefined;
    }

    let cancelled = false;
    let timer;

    async function preparePopup() {
      const stored = readStoredJson(subscriberStorageKey, null);
      if (stored?.dismissed || stored?.subscribed) {
        return;
      }

      const health = await getSubscriberStatus();
      if (cancelled || !health.configured) {
        return;
      }

      setReady(true);
      timer = window.setTimeout(() => setOpen(true), 5500);
    }

    preparePopup().catch(() => undefined);

    return () => {
      cancelled = true;
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  function closePopup() {
    writeStoredJson(subscriberStorageKey, { dismissed: true, dismissedAt: new Date().toISOString() });
    setOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextEmail = email.trim();

    if (!isValidEmail(nextEmail)) {
      setStatus("error");
      setMessage("Add a valid email so we can keep you posted.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await submitSubscriber(nextEmail, website);
      writeStoredJson(subscriberStorageKey, { subscribed: true, email: nextEmail, subscribedAt: new Date().toISOString() });
      setStatus("success");
      setMessage("You're on the list.");
      window.setTimeout(() => setOpen(false), 1400);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Subscriber signup could not be saved.");
    }
  }

  if (!subscribeEndpoint || !ready || !open) {
    return null;
  }

  return (
    <div className="subscriber-popup" role="dialog" aria-modal="true" aria-labelledby="subscriber-title">
      <button className="subscriber-scrim" type="button" aria-label="Close subscriber form" onClick={closePopup} />
      <form className="subscriber-card" onSubmit={handleSubmit}>
        <button className="subscriber-close" type="button" onClick={closePopup} aria-label="Close subscriber form">
          Close
        </button>
        <span>DE.LA.COSTA dispatch</span>
        <h2 id="subscriber-title">First look at drops, zines, and town notes.</h2>
        <p>Join the list for new shirt releases, print runs, and archive updates before they move through the shop.</p>
        <input
          className="subscriber-honeypot"
          type="text"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex="-1"
          autoComplete="off"
          aria-hidden="true"
        />
        <div className="subscriber-row">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="email address"
            aria-label="Email address"
            autoComplete="email"
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Joining" : "Join"}
          </button>
        </div>
        {message && <small className={status === "success" ? "subscriber-success" : "subscriber-error"}>{message}</small>}
      </form>
    </div>
  );
}
function updateProfileField(profile, field, value) {
  return {
    ...profile,
    [field]: value,
  };
}

function buildRemixCopy(item, presetName) {
  return {
    headline: `${item.title} / ${item.series}`,
    intro: `${item.caption} Built as a ${presetName.toLowerCase()} page from @_de.la.costa_ images, captions, tags, and public profile details.`,
  };
}

function buildZinePages(zine, items) {
  const selectedItems = items.slice(0, zine.pageCount);

  return Array.from({ length: zine.pageCount }, (_, index) => {
    const item = selectedItems[index % selectedItems.length];
    const template = pageTemplates[index === 0 ? 0 : (index % (pageTemplates.length - 1)) + 1];
    const supportingItems = [
      item,
      items[(index + 2) % items.length],
      items[(index + 5) % items.length],
      items[(index + 8) % items.length],
    ];

    return {
      pageNumber: index + 1,
      template,
      item,
      supportingItems,
      kicker: index === 0 ? "Issue 001" : item.series,
      title: index === 0 ? zine.title : item.title,
      caption: index === 0 ? zine.subtitle : item.caption,
    };
  });
}

function getZineChecks(zine, pages) {
  const checks = [
    {
      label: "Booklet page count",
      pass: zine.pageCount % 4 === 0,
      detail: `${zine.pageCount} pages selected. Booklets print cleanest in multiples of 4.`,
    },
    {
      label: "Cover selected",
      pass: Boolean(pages[0]?.item?.image),
      detail: pages[0]?.item?.title || "Choose a cover image.",
    },
    {
      label: "Image set loaded",
      pass: pages.every((page) => Boolean(page.item.image)),
      detail: `${pages.length} pages have Instagram-sourced images attached.`,
    },
    {
      label: "Bleed guide",
      pass: zine.guides,
      detail: zine.guides ? "Trim, bleed, and safe-area guides are visible." : "Turn guides on before exporting.",
    },
    {
      label: "Caption fit",
      pass: pages.every((page) => page.caption.length < 180),
      detail: "Long captions are shortened for print layout stability.",
    },
  ];

  return checks;
}

const defaultConfig = {
  profile: starterProfile,
  theme: "zine",
  layout: "split",
  density: "1",
  motion: true,
  remixName: "Manual",
  sections: {
    highlights: true,
    archive: true,
    motion: true,
    mediaWall: true,
    notes: true,
    json: false,
  },
};

const defaultZine = {
  preset: "mini",
  pageCount: zinePresets.mini.pageCount,
  title: "De.La.Costa Issue 001",
  subtitle: "A print-ready zine built from @_de.la.costa_ images, captions, community memory, and moving archive notes.",
  guides: true,
  seed: 0,
};

function readStoredJson(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredJson(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function createSnapshot(config, zine, selectedItem, typeFilter, seriesFilter) {
  return {
    config,
    zine,
    selectedHref: selectedItem.href,
    typeFilter,
    seriesFilter,
  };
}

function resolveSnapshot(snapshot) {
  return {
    ...snapshot,
    selectedItem: starterItems.find((item) => item.href === snapshot.selectedHref) || starterItems[0],
  };
}

function buildProjectExport(config, zine, selectedItem, zinePages, checks, savedIssues) {
  return {
    exportedAt: new Date().toISOString(),
    profile: config.profile,
    site: {
      theme: config.theme,
      layout: config.layout,
      density: config.density,
      sections: config.sections,
      featured: selectedItem.title,
    },
    zine,
    zinePages: zinePages.map((page) => ({
      pageNumber: page.pageNumber,
      template: page.template.key,
      title: page.title,
      caption: page.caption,
      image: page.item.image,
      source: page.item.href,
    })),
    preflight: checks,
    savedIssues,
    sourceAccount: starterProfile.handle,
  };
}

function BuilderPanel({
  config,
  selectedItem,
  zine,
  savedIssues,
  canUndo,
  canRedo,
  lastSaved,
  onConfigChange,
  onExportProject,
  onLoadIssue,
  onProfileChange,
  onRemix,
  onSaveIssue,
  onUndo,
  onRedo,
  onZineChange,
  onZineShuffle,
  onSectionToggle,
  onSelectedItemChange,
  onClose,
}) {
  return (
    <aside className="builder-panel" aria-label="Website builder controls">
      <div className="builder-title">
        <div>
          <span>Studio</span>
          <strong>DE.LA.COSTA site builder</strong>
        </div>
        <button className="studio-close" type="button" onClick={onClose} aria-label="Close studio">
          Close
        </button>
      </div>

      <div className="studio-actions">
        <button type="button" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo}>
          Redo
        </button>
        <button type="button" onClick={onExportProject}>
          Export
        </button>
      </div>

      <div className="save-status">
        <span>Autosave</span>
        <strong>{lastSaved ? `Saved ${lastSaved}` : "Ready"}</strong>
      </div>

      <button className="remix-button" type="button" onClick={onRemix}>
        Remix site
      </button>

      <div className="remix-status">
        <span>Current remix</span>
        <strong>{config.remixName}</strong>
      </div>

      <label>
        Theme
        <select value={config.theme} onChange={(event) => onConfigChange({ theme: event.target.value })}>
          {Object.entries(themes).map(([key, theme]) => (
            <option value={key} key={key}>{theme.label}</option>
          ))}
        </select>
      </label>

      <label>
        Layout
        <select value={config.layout} onChange={(event) => onConfigChange({ layout: event.target.value })}>
          <option value="split">Split hero</option>
          <option value="poster">Poster hero</option>
          <option value="stack">Stacked editorial</option>
        </select>
      </label>

      <label>
        Density
        <input
          type="range"
          min="0"
          max="2"
          step="1"
          value={config.density}
          onChange={(event) => onConfigChange({ density: event.target.value })}
        />
      </label>

      <div className="builder-group">
        <span>Sections</span>
        {Object.entries(sectionLabels).map(([key, label]) => (
          <label className="check-row" key={key}>
            <input
              type="checkbox"
              checked={config.sections[key]}
              onChange={() => onSectionToggle(key)}
            />
            {label}
          </label>
        ))}
      </div>

      <label>
        Hero headline
        <textarea
          value={config.profile.headline}
          onChange={(event) => onProfileChange("headline", event.target.value)}
          rows="5"
        />
      </label>

      <label>
        Intro
        <textarea
          value={config.profile.intro}
          onChange={(event) => onProfileChange("intro", event.target.value)}
          rows="4"
        />
      </label>

      <label>
        Featured media
        <select value={selectedItem.href} onChange={(event) => onSelectedItemChange(event.target.value)}>
          {starterItems.map((item) => (
            <option value={item.href} key={item.href}>{item.title}</option>
          ))}
        </select>
      </label>

      <div className="builder-group zine-controls">
        <span>Zine Studio</span>
        <label>
          Issue format
          <select value={zine.preset} onChange={(event) => onZineChange({ preset: event.target.value, pageCount: zinePresets[event.target.value].pageCount })}>
            {Object.entries(zinePresets).map(([key, preset]) => (
              <option value={key} key={key}>{preset.label}</option>
            ))}
          </select>
        </label>
        <label>
          Issue title
          <input
            value={zine.title}
            onChange={(event) => onZineChange({ title: event.target.value })}
          />
        </label>
        <label>
          Subtitle
          <textarea
            value={zine.subtitle}
            onChange={(event) => onZineChange({ subtitle: event.target.value })}
            rows="3"
          />
        </label>
        <label>
          Pages
          <input
            type="range"
            min="4"
            max="20"
            step="4"
            value={zine.pageCount}
            onChange={(event) => onZineChange({ pageCount: Number(event.target.value) })}
          />
          <small>{zine.pageCount} pages</small>
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={zine.guides}
            onChange={() => onZineChange({ guides: !zine.guides })}
          />
          Show print guides
        </label>
        <button className="panel-button" type="button" onClick={onZineShuffle}>
          Remix zine issue
        </button>
        <button className="panel-button filled" type="button" onClick={onSaveIssue}>
          Save issue
        </button>
        <div className="issue-library">
          <span>Issue Library</span>
          {savedIssues.length === 0 ? (
            <small>No saved issues yet.</small>
          ) : (
            savedIssues.map((issue) => (
              <button type="button" key={issue.id} onClick={() => onLoadIssue(issue.id)}>
                <strong>{issue.title}</strong>
                <small>{issue.presetLabel} / {issue.pageCount} pages</small>
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

function ArchiveCard({ item, selected, onSelect }) {
  return (
    <button className={`archive-card ${selected ? "selected" : ""}`} type="button" onClick={() => onSelect(item)}>
      <img src={item.image} alt={item.title} />
      <span className="archive-type">{item.type}</span>
      <strong>{item.title}</strong>
      <small>{item.series}</small>
      <p>{item.caption}</p>
    </button>
  );
}

function ZinePage({ page, guides }) {
  return (
    <article className={`zine-page ${page.template.className} ${guides ? "guides-on" : ""}`}>
      <div className="safe-area">
        <div className="zine-kicker">{page.kicker}</div>
        <h3>{page.title}</h3>
        {page.template.key === "grid" ? (
          <div className="zine-contact-grid">
            {page.supportingItems.map((item) => (
              <figure key={`${page.pageNumber}-${item.href}`}>
                <img src={item.image} alt={item.title} />
                <figcaption>{item.title}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <img className="zine-hero-image" src={page.item.image} alt={page.item.title} />
        )}
        <p>{page.caption}</p>
        <footer>
          <span>{page.template.label}</span>
          <strong>{String(page.pageNumber).padStart(2, "0")}</strong>
        </footer>
      </div>
    </article>
  );
}

function ZineStudio({ zine, pages, checks, selectedSpread, onSpreadChange, onSelectItem }) {
  const preset = zinePresets[zine.preset];
  const totalSpreads = Math.ceil(pages.length / 2);
  const leftPage = pages[selectedSpread * 2];
  const rightPage = pages[selectedSpread * 2 + 1];

  return (
    <section className="zine-section" id="zine">
      <div className="zine-heading">
        <div>
          <p className="eyebrow">Zine Studio</p>
          <h2>Build a print-ready issue from the Instagram archive.</h2>
          <p>{preset.description}</p>
        </div>
        <div className="zine-specs" aria-label="Current zine specs">
          <span>{preset.label}</span>
          <strong>{preset.size}</strong>
          <small>{preset.trim}</small>
        </div>
      </div>

      <div className="zine-workbench">
        <aside className="zine-sidebar">
          <div>
            <p className="eyebrow">Preflight</p>
            <div className="preflight-list">
              {checks.map((check) => (
                <div className={check.pass ? "pass" : "warn"} key={check.label}>
                  <strong>{check.pass ? "Ready" : "Check"}</strong>
                  <span>{check.label}</span>
                  <small>{check.detail}</small>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">Issue Pages</p>
            <div className="page-strip">
              {pages.map((page, index) => (
                <button
                  className={Math.floor(index / 2) === selectedSpread ? "active" : ""}
                  type="button"
                  key={page.pageNumber}
                  onClick={() => onSpreadChange(Math.floor(index / 2))}
                >
                  <img src={page.item.image} alt="" />
                  <span>{page.pageNumber}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="zine-preview-panel">
          <div className="spread-toolbar">
            <button type="button" onClick={() => onSpreadChange(Math.max(0, selectedSpread - 1))}>
              Previous
            </button>
            <span>Spread {selectedSpread + 1} of {totalSpreads}</span>
            <button type="button" onClick={() => onSpreadChange(Math.min(totalSpreads - 1, selectedSpread + 1))}>
              Next
            </button>
          </div>

          <div className={`zine-spread ${zine.guides ? "guides-on" : ""}`}>
            {leftPage && <ZinePage page={leftPage} guides={zine.guides} />}
            {rightPage && <ZinePage page={rightPage} guides={zine.guides} />}
          </div>

          <div className="print-actions">
            <button type="button" onClick={() => window.print()}>
              Print preview
            </button>
            <a href="#archive">Swap source images</a>
          </div>
        </div>
      </div>

      <div className="zine-source-grid" aria-label="Zine source images">
        {starterItems.slice(0, 8).map((item) => (
          <button type="button" key={`zine-source-${item.href}`} onClick={() => onSelectItem(item)}>
            <img src={item.image} alt={item.title} />
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

const merchandise = [
  {
    id: "bandana-inspired-corner-print",
    name: "Bandana-Inspired Graphic T-Shirt — Black Ornamental Corner Print",
    price: "$31.01",
    sizePrices: { "2XL": "$32.26" },
    image: "https://images-api.printify.com/mockup/6a63d7da4442ce52140a4f8d/73207/98445/bandana-inspired-graphic-t-shirt-black-ornamental-corner-print.jpg?camera_label=front&revision=1784930297570",
    backImage: "https://images-api.printify.com/mockup/6a63d7da4442ce52140a4f8d/73207/98446/bandana-inspired-graphic-t-shirt-black-ornamental-corner-print.jpg?camera_label=back&revision=1784930297588",
    story: "Bandana-Inspired Graphic",
    color: "Pop-Up Shop",
  },
  {
    id: "raises-en-la-tierra",
    name: "'Raises En La Tierra' Graphic T-Shirt — Black Aztec Back Print",
    price: "$31.01",
    sizePrices: { "2XL": "$32.26" },
    image: "https://images-api.printify.com/mockup/6a63ca59719b931bfe05a193/79018/98445/raises-en-la-tierra-graphic-t-shirt-black-aztec-back-print.jpg?camera_label=front&revision=1784930173914",
    backImage: "https://images-api.printify.com/mockup/6a63ca59719b931bfe05a193/79018/98446/raises-en-la-tierra-graphic-t-shirt-black-aztec-back-print.jpg?camera_label=back&revision=1784930174031",
    story: "Raises En La Tierra",
    color: "Pop-Up Shop",
  },
  {
    id: "tribal-geometry",
    name: "Tribal Geometry T-Shirt — NAHUATL -Inspired Chest & Back Graphic",
    price: "$31.01",
    sizePrices: { "2XL": "$32.26" },
    image: "https://images-api.printify.com/mockup/6a63ad939afcd66a3c07601b/73207/98445/tribal-geometry-t-shirt-nahuatl-inspired-chest-back-graphic.jpg?camera_label=front&revision=1784930066910",
    backImage: "https://images-api.printify.com/mockup/6a63ad939afcd66a3c07601b/73207/98446/tribal-geometry-t-shirt-nahuatl-inspired-chest-back-graphic.jpg?camera_label=back&revision=1784930066928",
    story: "Tribal Geometry",
    color: "Pop-Up Shop",
  },
  {
    id: "young-boyz",
    name: "Street Crew Graphic T-Shirt — \"Better Together\" Floating Heads Backprint",
    price: "$31.01",
    sizePrices: { "2XL": "$32.26" },
    image: "https://images-api.printify.com/mockup/6a6247b039295caab900c2c7/73207/98445/street-crew-graphic-tshirt-better-together-floating-heads-backprint.jpg?camera_label=front&revision=1784930256662",
    backImage: "https://images-api.printify.com/mockup/6a6247b039295caab900c2c7/73207/98446/street-crew-graphic-tshirt-better-together-floating-heads-backprint.jpg?camera_label=back&revision=1784930256687",
    story: "Better Together",
    color: "Pop-Up Shop",
  },
  {
    id: "no-bad-days",
    name: "No Bad Days Skull Tee",
    price: "$29.05",
    sizePrices: { "2XL": "$31.06" },
    image: "https://images-api.printify.com/mockup/6a62444306936faf06051c77/78973/98445/no-bad-days-skull-tee.jpg?camera_label=front&revision=1784929657944",
    backImage: "https://images-api.printify.com/mockup/6a62444306936faf06051c77/78973/98446/no-bad-days-skull-tee.jpg?camera_label=back&revision=1784929657952",
    story: "No Bad Days",
    color: "Pop-Up Shop",
  },
  {
    id: "watching-me-closely",
    name: "Boxy Tee — 'The Rose That Grew From Concrete' Chest Print, Angels Back Art",
    price: "$36.15",
    sizePrices: { "2XL": "$36.92" },
    image: "https://pfy-prod-products-mockup-media.s3.us-east-2.amazonaws.com/files/2026/07/20260723153027-1f186ab6-e694-650e-b98a-6e2d9bbeff50.png?revision=1784928763066",
    backImage: "https://pfy-prod-products-mockup-media.s3.us-east-2.amazonaws.com/files/2026/07/20260723153031-1f186ab7-0aaf-6c5e-8a0a-0ae0e1a35098.png?revision=1784928763086",
    story: "The Rose That Grew From Concrete",
    color: "Pop-Up Shop",
  },
  {
    id: "sin-miedo",
    name: "Sin Miedo Graphic Tee — Urban Street Art T-Shirt",
    price: "$29.45",
    sizePrices: { "2XL": "$31.80" },
    image: "https://images-api.printify.com/mockup/6a5eeeab91d18ea0270d1d03/12100/92570/sin-miedo-graphic-tee-urban-street-art-t-shirt.jpg?camera_label=front&revision=1784929988524",
    backImage: "https://images-api.printify.com/mockup/6a5eeeab91d18ea0270d1d03/12100/92571/sin-miedo-graphic-tee-urban-street-art-t-shirt.jpg?camera_label=back&revision=1784929988558",
    story: "Sin Miedo",
    color: "Pop-Up Shop",
  },
];

const heroCampaignItems = [starterItems[4], starterItems[0], starterItems[7], starterItems[9]];

function MerchCard({ product, onOpen }) {
  return (
    <article className="merch-card">
      <button className="merch-image-button" type="button" onClick={() => onOpen(product)}>
        <div className="merch-image-pair">
          <figure>
            <img src={product.image} alt={`${product.name}, front`} loading="lazy" decoding="async" />
            <figcaption>Front</figcaption>
          </figure>
          {product.backImage && (
            <figure>
              <img src={product.backImage} alt={`${product.name}, back`} loading="lazy" decoding="async" />
              <figcaption>Back</figcaption>
            </figure>
          )}
        </div>
        <span>Quick view</span>
      </button>
      <div className="merch-meta">
        <div>
          <strong>{product.name}</strong>
          <small>{product.color} / Artist edition{product.sizePrices?.["2XL"] ? ` / 2XL ${product.sizePrices["2XL"]}` : ""}</small>
        </div>
        <span>From {product.price}</span>
      </div>
    </article>
  );
}

function getProductPrice(product, size) {
  return product.sizePrices?.[size] || product.price;
}

function priceToNumber(price) {
  return Number(price.replace(/[^0-9.]/g, ""));
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function CartDrawer({ items, open, checkoutState, onClose, onCheckout, onQuantityChange, onRemove }) {
  const subtotal = items.reduce((total, item) => total + priceToNumber(item.price) * item.quantity, 0);

  return (
    <div className={`cart-shell ${open ? "open" : ""}`} aria-hidden={!open}>
      <button className="cart-backdrop" type="button" aria-label="Close bag" onClick={onClose} />
      <aside className="cart-drawer" aria-label="Shopping bag">
        <header>
          <div>
            <span>DE.LA.COSTA</span>
            <h2>Your bag</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close bag">X</button>
        </header>

        {items.length === 0 ? (
          <div className="empty-cart">
            <strong>Your bag is empty.</strong>
            <p>Choose a piece from Edition 001.</p>
            <button type="button" onClick={onClose}>Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {items.map((item) => (
                <article className="cart-line" key={`${item.id}-${item.size}`}>
                  <img src={item.image} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.color} / {item.size}</span>
                    <small>{item.price}</small>
                    <div className="quantity-control" aria-label={`Quantity for ${item.name}, size ${item.size}`}>
                      <button type="button" onClick={() => onQuantityChange(item, -1)} aria-label="Decrease quantity">-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => onQuantityChange(item, 1)} aria-label="Increase quantity">+</button>
                    </div>
                  </div>
                  <button className="remove-line" type="button" onClick={() => onRemove(item)}>Remove</button>
                </article>
              ))}
            </div>
            <footer className="cart-summary">
              <div><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
              <small>Size, quantity, shipping, and taxes are confirmed in the secure Printify store.</small>
              <button className="checkout-button" type="button" onClick={onCheckout} disabled={checkoutState.loading}>
                {checkoutState.loading ? "Opening Printify..." : "Continue to Printify"}
              </button>
              {checkoutState.error && <p role="alert">{checkoutState.error}</p>}
              {!isPrintifyConfigured() && <small className="checkout-pending">Printify Pop-Up Store connection required before taking payment.</small>}
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function GeneratedSite({
  config,
  selectedItem,
  zine,
  zinePages,
  zineChecks,
  selectedSpread,
  visibleItems,
  typeFilter,
  seriesFilter,
  onTypeFilter,
  onSeriesFilter,
  onSpreadChange,
  onSelectItem,
  onMotionToggle,
  onOpenStudio,
}) {
  const storyItems = [starterItems[0], starterItems[7], starterItems[10]];
  const seriesFilters = ["all series", ...Array.from(new Set(starterItems.map((item) => item.series)))];
  const [heroIndex, setHeroIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(() => new URLSearchParams(window.location.search).get("menu") === "open");
  const [activeProduct, setActiveProduct] = useState(() => {
    const productId = new URLSearchParams(window.location.search).get("product");
    return merchandise.find((product) => product.id === productId) || null;
  });
  const [selectedSize, setSelectedSize] = useState("M");
  const [cartItems, setCartItems] = useState(() => readStoredJson(cartStorageKey, []));
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState({ loading: false, error: "" });
  const [addedMessage, setAddedMessage] = useState("");
  const selectedProductPrice = activeProduct ? getProductPrice(activeProduct, selectedSize) : "";
  const heroItem = heroCampaignItems[heroIndex];
  const bagCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    if (!config.motion) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroCampaignItems.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [config.motion]);

  useEffect(() => {
    if (!activeProduct && !cartOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveProduct(null);
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProduct, cartOpen]);

  useEffect(() => {
    writeStoredJson(cartStorageKey, cartItems);
  }, [cartItems]);

  function stepHero(direction) {
    setHeroIndex((current) => (current + direction + heroCampaignItems.length) % heroCampaignItems.length);
  }

  function openProduct(product) {
    setActiveProduct(product);
    setSelectedSize("M");
    setAddedMessage("");
  }

  function addToBag() {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === activeProduct.id && item.size === selectedSize);
      if (existing) {
        return current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...activeProduct, price: getProductPrice(activeProduct, selectedSize), size: selectedSize, quantity: 1 }];
    });
    setAddedMessage(`${activeProduct.name} / ${selectedSize} added`);
  }

  function changeCartQuantity(target, direction) {
    setCartItems((current) => current.flatMap((item) => {
      if (item.id !== target.id || item.size !== target.size) {
        return [item];
      }
      const quantity = item.quantity + direction;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  }

  function removeCartItem(target) {
    setCartItems((current) => current.filter((item) => item.id !== target.id || item.size !== target.size));
  }

  function checkout() {
    setCheckoutState({ loading: true, error: "" });
    try {
      const checkoutUrl = getPrintifyCheckoutUrl(cartItems);
      window.location.assign(checkoutUrl);
    } catch (error) {
      setCheckoutState({ loading: false, error: error.message || "Printify could not be opened." });
    }
  }

  return (
    <div className={`generated-site ${config.motion ? "motion-on" : "motion-off"}`}>
      <div className="announcement">Pride in my community</div>
      <header className="site-header">
        <button className="menu-button" type="button" onClick={() => setMenuOpen((current) => !current)} aria-expanded={menuOpen}>
          Menu
        </button>
        <a className="wordmark" href="#top" aria-label="DE.LA.COSTA home">DE.LA.COSTA</a>
        <nav className={menuOpen ? "open" : ""} aria-label="Site sections">
          <a href="#stories" onClick={() => setMenuOpen(false)}>Stories</a>
          <a href="#archive" onClick={() => setMenuOpen(false)}>Archive</a>
          <a href="#zine" onClick={() => setMenuOpen(false)}>Zine</a>
          <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="#forge" onClick={() => setMenuOpen(false)}>Forge</a>
          <button type="button" onClick={onOpenStudio}>Studio</button>
          <button className="bag-count" type="button" onClick={() => setCartOpen(true)}>Bag {bagCount}</button>
        </nav>
      </header>

      <main id="top">
        <section className="campaign-hero" aria-label="Featured Instagram story">
          <img key={heroItem.image} src={heroItem.image} alt={heroItem.title} />
          <div className="campaign-shade" />
          <div className={`campaign-copy ${heroItem.title.length > 20 ? "long-title" : ""}`}>
            <span>{heroItem.series}</span>
            <h1>{heroItem.title}</h1>
            <p>{heroItem.caption}</p>
            <a href={heroItem.href} target="_blank" rel="noreferrer">View story</a>
          </div>
          <div className="hero-controls" aria-label="Campaign slideshow controls">
            <span>{String(heroIndex + 1).padStart(2, "0")} / {String(heroCampaignItems.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => stepHero(-1)}>Previous</button>
            <button type="button" onClick={onMotionToggle}>{config.motion ? "Pause" : "Play"}</button>
            <button type="button" onClick={() => stepHero(1)}>Next</button>
          </div>
        </section>

        <section className="merch-section" id="shop">
          <div className="merch-heading">
            <div>
              <span>Edition 001</span>
              <h2>Art to wear</h2>
            </div>
            <p>Original DE.LA.COSTA clothing built from artwork and stories in the Instagram archive.</p>
          </div>
          <div className="merch-grid">
            {merchandise.map((product) => <MerchCard product={product} onOpen={openProduct} key={product.id} />)}
            <a className="merch-story" href="https://www.instagram.com/_de.la.costa_/" target="_blank" rel="noreferrer">
              <img src="/instagram/realest-feeling.jpg" alt="The Realest Feeling Instagram post" />
              <span>From the archive</span>
              <strong>The Realest Feeling</strong>
              <small>View the original clothing post</small>
            </a>
          </div>
        </section>

        <SiteForge />

        <section className="stories-section" id="stories">
          <div className="editorial-heading">
            <span>Latest stories</span>
            <h2>The town, the tracks, the people.</h2>
          </div>
          <div className="story-grid">
            {storyItems.map((item, index) => (
              <article className="story-card" key={item.href}>
                <button type="button" onClick={() => onSelectItem(item)}>
                  <img src={item.image} alt={item.title} />
                </button>
                <span>{String(index + 1).padStart(2, "0")} / {item.series}</span>
                <h3>{item.title}</h3>
                <p>{item.caption}</p>
                <a href={item.href} target="_blank" rel="noreferrer">Open on Instagram</a>
              </article>
            ))}
          </div>
        </section>

        {config.sections.archive && (
          <section className="archive-section" id="archive">
            <div className="archive-toolbar">
              <div>
                <span>Public archive</span>
                <h2>Posts and reels</h2>
              </div>
              <div className="controls">
                <div className="segmented" aria-label="Post type filter">
                  {["all", "post", "reel"].map((filter) => (
                    <button className={typeFilter === filter ? "active" : ""} key={filter} type="button" onClick={() => onTypeFilter(filter)}>
                      {filter}
                    </button>
                  ))}
                </div>
                <select value={seriesFilter} onChange={(event) => onSeriesFilter(event.target.value)} aria-label="Filter by series">
                  {seriesFilters.map((series) => <option key={series}>{series}</option>)}
                </select>
              </div>
            </div>
            <div className="archive-layout">
              <div className="archive-grid">
                {visibleItems.map((item) => (
                  <ArchiveCard item={item} key={item.href} selected={selectedItem.href === item.href} onSelect={onSelectItem} />
                ))}
              </div>
              <aside className="detail-panel">
                <img className="detail-image" src={selectedItem.image} alt={selectedItem.title} />
                <span>{selectedItem.type} / {selectedItem.series}</span>
                <h3>{selectedItem.title}</h3>
                <p>{selectedItem.caption}</p>
                <div className="badges">{selectedItem.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <a href={selectedItem.href} target="_blank" rel="noreferrer">Open on Instagram</a>
              </aside>
            </div>
          </section>
        )}

        <ZineStudio
          zine={zine}
          pages={zinePages}
          checks={zineChecks}
          selectedSpread={selectedSpread}
          onSpreadChange={onSpreadChange}
          onSelectItem={onSelectItem}
        />

        {config.sections.highlights && (
          <section className="field-notes">
            <div className="editorial-heading">
              <span>Field notes</span>
              <h2>More from the profile</h2>
            </div>
            <div className="field-grid">
              {starterHighlights.map((item) => (
                <a href={item.href} target="_blank" rel="noreferrer" key={item.title}>
                  <img src={item.image} alt={item.title} />
                  <span>{item.type}</span>
                  <strong>{item.title}</strong>
                </a>
              ))}
            </div>
          </section>
        )}

        {config.sections.notes && (
          <section className="community-section" id="community">
            <span>Community note</span>
            <blockquote>"No matter where I am, no matter what I do, I am always coming back home to you."</blockquote>
            <a href="https://www.instagram.com/_de.la.costa_/" target="_blank" rel="noreferrer">Follow @_de.la.costa_</a>
          </section>
        )}

        {config.sections.json && (
          <section className="json-section">
            <h2>Generated site data</h2>
            <pre>{JSON.stringify({ profile: config.profile, sections: config.sections, featured: selectedItem.title }, null, 2)}</pre>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <strong>DE.LA.COSTA</strong>
        <span>{config.profile.bio}</span>
        <a href="https://www.instagram.com/_de.la.costa_/" target="_blank" rel="noreferrer">Instagram</a>
      </footer>

      {activeProduct && (
        <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-title">
          <button className="modal-backdrop" type="button" aria-label="Close product" onClick={() => setActiveProduct(null)} />
          <div className="product-dialog">
            <button className="modal-close" type="button" onClick={() => setActiveProduct(null)}>Close</button>
            <div className="product-image-pair">
              <figure>
                <img src={activeProduct.image} alt={`${activeProduct.name}, front`} decoding="async" />
                <figcaption>Front</figcaption>
              </figure>
              {activeProduct.backImage && (
                <figure>
                  <img src={activeProduct.backImage} alt={`${activeProduct.name}, back`} decoding="async" />
                  <figcaption>Back</figcaption>
                </figure>
              )}
            </div>
            <div className="product-info">
              <span>Artist edition / {activeProduct.color}</span>
              <h2 id="product-title">{activeProduct.name}</h2>
              <strong>{selectedProductPrice}</strong>
              {activeProduct.sizePrices?.["2XL"] && <small className="size-price-note">2XL prices at {activeProduct.sizePrices["2XL"]}.</small>}
              <p>Original artwork drawn from the @_de.la.costa_ Instagram archive. Heavyweight cotton, screen-print concept.</p>
              <div className="size-picker" aria-label="Choose a size">
                {["S", "M", "L", "XL", "2XL"].map((size) => (
                  <button className={selectedSize === size ? "active" : ""} type="button" key={size} onClick={() => setSelectedSize(size)}>{size}</button>
                ))}
              </div>
              <button className="add-button" type="button" onClick={addToBag}>Add to bag</button>
              {addedMessage && <p className="added-message" role="status">{addedMessage}</p>}
              {addedMessage && <button className="view-bag-button" type="button" onClick={() => { setActiveProduct(null); setCartOpen(true); }}>View bag</button>}
            </div>
          </div>
        </div>
      )}
      <SubscriberPopup />
      <CartDrawer
        items={cartItems}
        open={cartOpen}
        checkoutState={checkoutState}
        onClose={() => setCartOpen(false)}
        onCheckout={checkout}
        onQuantityChange={changeCartQuantity}
        onRemove={removeCartItem}
      />
    </div>
  );
}

export default function App() {
  const storedDraft = readStoredJson(draftStorageKey, null);
  const storedSelectedItem = starterItems.find((item) => item.href === storedDraft?.selectedHref) || starterItems[4];
  const [config, setConfig] = useState(storedDraft?.config || defaultConfig);
  const [selectedItem, setSelectedItem] = useState(storedSelectedItem);
  const [typeFilter, setTypeFilter] = useState(storedDraft?.typeFilter || "all");
  const [seriesFilter, setSeriesFilter] = useState(storedDraft?.seriesFilter || "all series");
  const [selectedSpread, setSelectedSpread] = useState(0);
  const [zine, setZine] = useState(storedDraft?.zine || defaultZine);
  const [savedIssues, setSavedIssues] = useState(() => readStoredJson(issueStorageKey, []));
  const [lastSaved, setLastSaved] = useState("");
  const [studioOpen, setStudioOpen] = useState(() => new URLSearchParams(window.location.search).get("studio") === "open");
  const [history, setHistory] = useState({
    past: [],
    future: [],
  });

  const visibleItems = useMemo(() => {
    return starterItems.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesSeries = seriesFilter === "all series" || item.series === seriesFilter;
      return matchesType && matchesSeries;
    });
  }, [typeFilter, seriesFilter]);

  const zineItems = useMemo(() => {
    const rotation = zine.seed % starterItems.length;
    return [...starterItems.slice(rotation), ...starterItems.slice(0, rotation)];
  }, [zine.seed]);

  const zinePages = useMemo(() => {
    return buildZinePages(zine, zineItems);
  }, [zine, zineItems]);

  const zineChecks = useMemo(() => {
    return getZineChecks(zine, zinePages);
  }, [zine, zinePages]);

  useEffect(() => {
    const draft = createSnapshot(config, zine, selectedItem, typeFilter, seriesFilter);
    writeStoredJson(draftStorageKey, draft);
    setLastSaved(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  }, [config, zine, selectedItem, typeFilter, seriesFilter]);

  useEffect(() => {
    writeStoredJson(issueStorageKey, savedIssues);
  }, [savedIssues]);

  useEffect(() => {
    if (!studioOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setStudioOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [studioOpen]);

  function rememberCurrent() {
    const snapshot = createSnapshot(config, zine, selectedItem, typeFilter, seriesFilter);
    setHistory((current) => ({
      past: [...current.past.slice(-24), snapshot],
      future: [],
    }));
  }

  function applySnapshot(snapshot) {
    const resolved = resolveSnapshot(snapshot);
    setConfig(resolved.config);
    setZine(resolved.zine);
    setSelectedItem(resolved.selectedItem);
    setTypeFilter(resolved.typeFilter);
    setSeriesFilter(resolved.seriesFilter);
    setSelectedSpread(0);
  }

  function patchConfig(patch) {
    rememberCurrent();
    setConfig((current) => ({
      ...current,
      ...patch,
    }));
  }

  function changeProfile(field, value) {
    rememberCurrent();
    setConfig((current) => ({
      ...current,
      profile: updateProfileField(current.profile, field, value),
    }));
  }

  function toggleSection(key) {
    rememberCurrent();
    setConfig((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [key]: !current.sections[key],
      },
    }));
  }

  function patchZine(patch) {
    rememberCurrent();
    setZine((current) => ({
      ...current,
      ...patch,
    }));
    if (patch.pageCount) {
      setSelectedSpread(0);
    }
  }

  function chooseFeatured(href) {
    const nextItem = starterItems.find((item) => item.href === href);
    if (nextItem) {
      rememberCurrent();
      setSelectedItem(nextItem);
    }
  }

  function changeTypeFilter(filter) {
    rememberCurrent();
    setTypeFilter(filter);
  }

  function changeSeriesFilter(filter) {
    rememberCurrent();
    setSeriesFilter(filter);
  }

  function remixSite() {
    rememberCurrent();
    const currentPresetIndex = remixPresets.findIndex((preset) => preset.name === config.remixName);
    const preset = remixPresets[(currentPresetIndex + 1) % remixPresets.length];
    const featuredItem = starterItems[preset.featuredIndex];
    const remixCopy = buildRemixCopy(featuredItem, preset.name);

    setSelectedItem(featuredItem);
    setTypeFilter("all");
    setSeriesFilter(featuredItem.series);
    setConfig((current) => ({
      ...current,
      theme: preset.theme,
      layout: preset.layout,
      density: preset.density,
      motion: preset.sections.motion,
      remixName: preset.name,
      sections: preset.sections,
      profile: {
        ...current.profile,
        ...remixCopy,
      },
    }));
  }

  function remixZine() {
    rememberCurrent();
    setZine((current) => {
      const presetKeys = Object.keys(zinePresets);
      const nextPreset = presetKeys[(presetKeys.indexOf(current.preset) + 1) % presetKeys.length];
      const leadItem = starterItems[(current.seed + 3) % starterItems.length];

      return {
        ...current,
        preset: nextPreset,
        pageCount: zinePresets[nextPreset].pageCount,
        title: `${leadItem.series} / Issue ${String(current.seed + 2).padStart(3, "0")}`,
        subtitle: `${leadItem.caption} Sequenced into a ${zinePresets[nextPreset].label.toLowerCase()} with trim guides and printable spreads.`,
        seed: current.seed + 3,
      };
    });
    setSelectedSpread(0);
  }

  function undo() {
    if (history.past.length === 0) {
      return;
    }

    const previous = history.past[history.past.length - 1];
    const present = createSnapshot(config, zine, selectedItem, typeFilter, seriesFilter);
    applySnapshot(previous);
    setHistory({
      past: history.past.slice(0, -1),
      future: [present, ...history.future],
    });
  }

  function redo() {
    if (history.future.length === 0) {
      return;
    }

    const next = history.future[0];
    const present = createSnapshot(config, zine, selectedItem, typeFilter, seriesFilter);
    applySnapshot(next);
    setHistory({
      past: [...history.past, present],
      future: history.future.slice(1),
    });
  }

  function saveIssue() {
    const issue = {
      id: `${Date.now()}`,
      title: zine.title,
      preset: zine.preset,
      presetLabel: zinePresets[zine.preset].label,
      pageCount: zine.pageCount,
      savedAt: new Date().toISOString(),
      zine,
      selectedHref: selectedItem.href,
    };

    setSavedIssues((current) => [issue, ...current.filter((saved) => saved.title !== issue.title)].slice(0, 8));
  }

  function loadIssue(id) {
    const issue = savedIssues.find((saved) => saved.id === id);
    if (!issue) {
      return;
    }

    rememberCurrent();
    setZine(issue.zine);
    setSelectedItem(starterItems.find((item) => item.href === issue.selectedHref) || starterItems[0]);
    setSelectedSpread(0);
  }

  function exportProject() {
    const exportData = buildProjectExport(config, zine, selectedItem, zinePages, zineChecks, savedIssues);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "de-la-costa-builder-project.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`builder-shell ${studioOpen ? "studio-open" : ""}`}>
      {studioOpen && <button className="studio-scrim" type="button" aria-label="Close studio" onClick={() => setStudioOpen(false)} />}
      <BuilderPanel
        config={config}
        selectedItem={selectedItem}
        zine={zine}
        savedIssues={savedIssues}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        lastSaved={lastSaved}
        onConfigChange={patchConfig}
        onExportProject={exportProject}
        onLoadIssue={loadIssue}
        onProfileChange={changeProfile}
        onRemix={remixSite}
        onSaveIssue={saveIssue}
        onUndo={undo}
        onRedo={redo}
        onZineChange={patchZine}
        onZineShuffle={remixZine}
        onSectionToggle={toggleSection}
        onSelectedItemChange={chooseFeatured}
        onClose={() => setStudioOpen(false)}
      />
      <GeneratedSite
        config={config}
        selectedItem={selectedItem}
        zine={zine}
        zinePages={zinePages}
        zineChecks={zineChecks}
        selectedSpread={selectedSpread}
        visibleItems={visibleItems}
        typeFilter={typeFilter}
        seriesFilter={seriesFilter}
        onTypeFilter={changeTypeFilter}
        onSeriesFilter={changeSeriesFilter}
        onSpreadChange={setSelectedSpread}
        onSelectItem={(item) => chooseFeatured(item.href)}
        onMotionToggle={() => patchConfig({ motion: !config.motion })}
        onOpenStudio={() => setStudioOpen(true)}
      />
    </div>
  );
}






