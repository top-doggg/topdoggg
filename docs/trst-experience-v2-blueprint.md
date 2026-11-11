# TRST Studios — Experience Architecture V2
**Research and source audit:** 2026-10-27  
**Status:** Design proposal; NOT deployed.  
**Production source:** `top-doggg/topdoggg@trststudios-storefront`, deployed commit `c3d1d282...`.  
**Owner approval required before UI implementation.**

## Executive verdict
TRST's best category is **an artist-led cultural archive with collectible apparel, public storytelling, and commissioned creative work**—not a general graphic-T-shirt shop and not a generic creative agency. The three connected conversion routes must be visible: explore authentic work, collect an edition, commission/collaborate with the studio. Community participation should have a separate consent-led path.

**Creative platform:** TRST Studios — presents, documents, publishes, and operates the studio.  
**Artist:** DE.LA.COSTA / Jorge S. Ruiz — authors the practice.  
**Art / editorial:** photographic work, film, visual editions, field notes.  
**Commerce:** limited or ongoing artist editions, fulfilled by Printify where verified.  
**Participation:** Open Thread and chapter-specific storytelling.  
**Services:** commissions, campaigns, design, collaborations and public art.

### Current architecture — verified
- Vite + React + Bun on Vercel, Node 24; Vercel production currently READY at `c3d1d282...`.
- GitHub source is `trststudios-storefront`, NOT the repository default branch `main`. Do not change this accidentally.
- Routes: `/`, `/work`, `/work/:id`, `/shop`, `/shop/:id`, `/open-thread`, chapter pages, `/partners`, `/journal`, entry pages, `/about`, `/fulfillment-policy`, plus noindex `/operations` and `/wholesale`.
- `src/main.jsx` selects page components by `resolveRoute` conditions, rather than a routing library. The built route HTML is emitted by `scripts/generate-route-html.mjs`.
- `src/app/SiteShell.jsx` uses a consistent shared nav on key routes. `src/Journal.jsx` also renders an internal page header, creating a structurally duplicated identity tier.
- Home `src/HomeCover.jsx`: typography-first hero, four path links, West of the Tracks feature and dispatch signup; shop `src/Storefront.jsx`: portfolio, products, contextual narrative, modal product interaction, subscriber pop-up.
- Existing token files have ink `#0b0b0b`, paper `#fffdf8`, signal red `#c72d26`, muted `#6b645b`; multiple large CSS files mix shared and page-specific styles.
- Printify is the checkout/fulfillment system of record. The DelaCosta Pop-Up storefront is the commerce destination; the authenticated API shop previously returned 'My new store', not proven to be DelaCosta.
- Production contains 12 public `api/*.js` handlers and is at the Vercel Hobby quota. A product or editorial design must NOT be implemented by adding another API handler.
- Production `CRON_SECRET` was NOT present in the verified environment-key response; `/api/indexnow-sync` depends on it. Investigate separately.
- This is a source and configuration audit, NOT a measured Lighthouse audit or proof of conversion rates.

## Diagnosed design weaknesses
**P0 – Positioning and hierarchy.** Home and inner pages alternate between DE.LA.COSTA-first and TRST-first identity; visitors need one clear explanation of the relationship. The homepage gives four nearly equivalent paths without a decisive featured creative image/release. Lead with art, then offer specific paths.

**P0 – Commerce trust + continuity.** Site has editorial product pages and then offsite Printify purchase. Avoid implying on-site checkout. Explain the handoff, fit, sizes, garment details, production/fulfillment, shipping and returns near every purchase CTA. Prevent published/archived/retired products from being sold by stale links.

**P1 – Visual system drift.** Site shell and editorial sections have multiple competing typographic/layout conventions; `src/App.css` and `src/storefront.css` exceed 60KB each. Establish reusable section, title, image, card, form and navigation patterns before doing visual polish.

**P1 – Double header / navigation semantics.** `Journal.jsx` includes its own header inside `SiteShell`. Unify page header and avoid duplicating brand/navigation at the top of editorial pages.

**P1 – Overlapping discovery paths.** Shop mixes portfolio/inquiry with shopping; keep one intentional cross-link to archive instead of making apparel customers navigate an enormous art index before seeing products.

**P1 – Large commerce modal.** Current `Storefront.jsx` includes size selector, modal product detail and external purchase. Lead visitors to dedicated canonical product URLs first, retaining lightbox only for imagery. Make clear that price/availability live at Printify until synced/verified.

**P2 – Accessibility and performance.** Test focus return/escape and body-scroll behavior in modals, keyboard filtering, responsive images, preloading and lazy-loading, 44px touch targets, contrast, alt descriptions. These are testing hypotheses until browser audit.

**P2 – Residual technical debt.** `src/index.css` still includes a CSS `:has` rule to hide an already excluded retired product. Remove only after behavior regression checks. Use typed content schema rather than stringly-typed product URL mapping.

## Benchmarks / what to borrow (not imitate)
1. **Patta** — community and cultural programs are genuine product pillars. Translate into authored Open Thread chapters, contribution rules, community credit and documented outcomes. https://patta.nl/pages/community
2. **Brain Dead** — cross-disciplinary art and subculture exist alongside commerce. Borrow confidence of art-first composition and collaborative programming, not the aesthetic assets. https://braindeadlabel.com/
3. **Aimé Leon Dore** — lookbook pacing, editorial restraint, image-led collections and purposeful white space. Translate to 1–2 hero artworks and modular releases. https://www.aimeleondore.com/
4. **The Hundreds** — long-form cultural argument and original editorial strengthen identity behind merchandise. Translate to first-person field notes and release stories. https://thehundreds.com/
5. **Baymard Institute** — apparel product decisions depend on visible fit/sizing/product imagery/return clarity. Use a clear PDP with visual variants and external checkout honesty. https://baymard.com/research/apparel-and-accessories

No available evidence here quantifies competitor revenue or attributes success to their layout alone.

## Proposed creative concept — THE LIVING RECORD
**Line:** `ART. PLACE. MEMORY. MADE TO CARRY.`  
**Positioning:** TRST Studios collects moments worth carrying—through original work, editions, storytelling and public collaboration.  
**Voice:** intimate documentary captions, deliberate art direction, confident and concise. Avoid fake urgency, fake edition limits, invented testimonials or generic motivational copy.

### Design DNA
- **Palette:** Ink `#0B0B0B`, gallery paper `#FFFDF8`, neutral concrete `#D8D1C7`, caption gray `#6B645B`, signal red `#C72D26`. Preserve artwork colors, especially the blue/cream Smile Now Cry Later design; reserve blue as art-driven accent rather than recoloring the full UI.
- **Type:** contemporary condensed display sans or system variable sans for headlines; highly legible neo-grotesk for nav/body; optional restrained editorial serif for quoted field notes. Do not invent brand lettering or modify the approved TRST logo.
- **Layout:** desktop 12-column grid; 48–80px outer gutters; baseline 8px spacing; article text max 65–75 characters/line; section paddings 80–128px desktop, 48–72px mobile.
- **Motion:** slow image reveal and small typographic movements on entrance only, optional 200–320ms transitions, `prefers-reduced-motion` support. Never delay access to CTAs.
- **Imagery:** authentic artist photos, documentary stills, approved art files, genuine T-shirt mockups. Avoid generic fashion stock imagery.

## Information architecture V2
Global header: `TRST STUDIOS` lockup (with secondary DE.LA.COSTA byline), `Work`, `Editions`, `Open Thread`, `Journal`, `Studio`, and featured `Shop drop` CTA. Map `Editions` to existing `/shop`, `Studio` to `/partners`; don't break canonical URLs. Footer: background/about, commissions, subscriber dispatch, fulfillment/privacy, Instagram.

**Homepage sections in order**
1. Masthead + documentary hero visual and the statement `A record of place. Made to live beyond the page.` CTAs: Explore the work / View editions.
2. Current feature: `West of the Tracks` as the main authored project, with one rich image, descriptive kicker, and link to project.
3. Three entryways: `THE WORK` (archive), `THE EDITIONS` (wearable artifacts), `THE PUBLIC RECORD` (Open Thread) — visual asymmetry, not identical blocks.
4. Featured edition spotlight: 1–2 approved products, editorial photography, size/price disclaimer and direct routes to `/shop/:id`.
5. Open Thread snapshot: actual active chapter, genuine participant permissions and one involvement CTA. No fabricated outcome counters.
6. Studio commissions: service categories, one or two verified examples, short inquiry CTA.
7. Journal and film: three most relevant stories as image/title/caption, optional video poster (do not auto-play audio).
8. Dispatch: one meaningful reason to subscribe, short form, proper success/error state.
9. Contextual footer with language explaining TRST / DE.LA.COSTA distinction.

**Shop/Edition listing**: visually dominant art/product photography; ~3 active products at baseline; no search UI needed until catalog grows; filter by actual available categories only; product cards show name, real current price, front/back toggle and available colors, never fake sizes.

**Product detail**: image gallery (front/back/detail and colorways), art story + physical garment details, selected size/color, concrete fulfillment note, clear `Continue to Printify` handoff; no on-site faux checkout. Approved pocket logo remains SMALL, exact art unchanged.

**Work detail**: hero image > artist statement > documentation > process > medium/location when verified > collect/inquire path. Cross-link only applicable editions.

**Open Thread**: editorial invitation, current chapter state, chapter archive, participation and consent; exact dates only if verified.

**Studio/Partners**: capability narrative, samples/real partner work, scoped entry inquiries, clearly separate from store.

## Experience primitives
- `Masthead`, `SiteNav`, `SiteFooter`
- `EditorialHero`, `ProjectSpotlight`, `ImageWithCaption`
- `EditionCard`, `ProductGallery`, `ProductFacts`, `PrintifyHandoff`
- `ChapterCard`, `DispatchForm`, `InquiryForm`, `StoryCard`
- `PageHeading`, `SectionLabel`, `Breadcrumbs`, `Skeleton`
Build these as React components after visual approval; consolidate CSS gradually rather than full platform migration.

## Non-negotiable implementation constraints
- Maintain GitHub branch `trststudios-storefront` and verified Vercel production/preview workflow.
- Existing 12-function ceiling: zero new serverless endpoints; reuse existing APIs and build-time content.
- Preserve all approved original art and trademark/wordmark, especially small chest TRST logo and Smile Now Cry Later back design.
- No database migration; Supabase currently is NOT part of storefront request path; Vercel Blob private records stay private.
- No secrets in public Vite variables; rotate previously exposed tokens.
- Keep external Printify purchase routing; require connected store identity, listing URL, variants, price and fulfillment verification before promoting new item.
- Keep generated HTML metadata, redirects, canonical, RSS/sitemap and noindex routes intact.
- No made-up scarcity, inventory, reviews, sales, collaborators or event dates.

## Launch gates and measurement
**Build:** `bun run build`, validated generated HTML and routes, no extra functions, preview READY, rollback identified.  
**Accessibility:** WCAG 2.2 AA targets; keyboard navigation, visible focus, image alt, form labeling, dialogs, reduced-motion.  
**Performance:** Field targets LCP <=2.5s, INP <=200ms, CLS <=0.1 on 75th-percentile mobile and desktop; measure, do not assert achieved.  
**Commerce:** verify each listing exists, price/stock/variants and external checkout on black/white merchandise, truthful shipping/returns.  
**Growth:** measure browse-to-PDP click, product outbound checkout click, commission inquiry rate, dispatch join rate, and consented chapter submissions. Establish baseline before claiming uplift.

## Phased decision
- **0 / no-code foundation:** owner approves concept, homepage hierarchy and exact imagery. Audit real browser desktop/mobile.
- **1 / design system:** consolidate tokens and reusable components with a single nav, editorial cards and style specification.
- **2 / homepage + shop:** redesign above-fold, feature, collection cards and product pages with verified commerce.
- **3 / community + studio:** Open Thread and commissioning journeys, improved dispatch.
- **4 / optimization:** user tests, accessibility, Core Web Vitals, telemetry and campaign experiments.

**Creative approval is required before production redesign.** This blueprint does not claim that a Superdesign canvas has been produced.
