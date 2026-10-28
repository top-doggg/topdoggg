# TRST Studios — Website Audit & Experience Architecture v2
**Assessment:** 2026-10-27 | **Status:** Design proposal only; no production UI changes
**Site:** https://trststudios.online | **Repo:** top-doggg/topdoggg, `trststudios-storefront`
**Verified deployment:** `c3d1d2826daa7c0c69479fd3a0d90d1495a1d258` (Vercel READY)
**Evidence tiers:** V = inspected live platform/source; I = design inference needing QA; P = proposal.

## Executive decision
TRST should not become a generic streetwear template or a portfolio disconnected from commerce. Build a **Living Archive / Edition House**: original artwork and neighborhood stories are the source; artist editions are the wearable artifacts; Open Thread is the participatory cultural layer; collaborations/inquiries are the professional service layer. One consistent editorial navigation and visual grammar should make these four destinations feel like one product.

The website should look like a contemporary independent art publication that happens to issue apparel, not an ecommerce template with a blog bolted on. The art is the primary identity, never replace the supplied TRST logo, featured artworks, or approved print placements.

## Current system — inspected facts
| Area | Evidence | Finding |
|---|---|---|
| Deployment | Vercel project `trststudios-replacement` | Production READY on `trststudios-storefront`. |
| Stack | `package.json`, `src/main.jsx` | React + Vite + Bun, Vercel Analytics / Speed Insights. Route selection via `resolveRoute()`; internal studio mode is dev-only. |
| Current homepage | `src/main.jsx`, `src/HomeCover.jsx` | Actual production route `/` renders `HomeCover`: editorial hero, 4 destination links, featured work, Dispatch signup. Older web crawl of an all-in-one home page may be stale; do not mistake it for the current render. |
| Brand shell | `src/app/SiteShell.jsx`, `src/app/site-navigation.js` | Header is text-first `DE.LA.COSTA` with small `TRST Studios`; top links Work, Shop, Open Thread, Partners, Artist. Different hierarchy than the desired TRST platform > DE.LA.COSTA first edition. |
| Portfolio | `src/Work.jsx`, `src/ProjectDetail.jsx`, `src/content/works.js` | Portfolio paths exist and can lead into collector inquiries. |
| Commerce | `src/Storefront.jsx`, `src/ProductDetail.jsx`, `src/content/products.js`, `src/printify.js` | Static product/pricing/mockup metadata and hardwired Printify Pop-Up URLs. External purchase handoff; no proof of payment captured on TRST. |
| Catalog inconsistency | `src/content/products.js`, `src/index.css` | `cheos-world` is in `allProducts` but filtered out of `products`; extra CSS hides it with `:has()`. Replace with an explicit publish/status model, not selector-based business logic. |
| Discovery graph | `src/content/contentGraph.js`, `scripts/generate-discovery-assets.mjs` | Related work/journal/content relationships exist; products in graph currently target `/shop` and are `indexable:false`, while sitemap generates `/shop/<id>` product URLs. Reconcile canonical semantics. |
| Community | `/open-thread` + city chapters, `docs/trst-open-thread-protocol.md` | Distinct participatory concept is a strategic differentiator; treat as community authorship, not an email farming feature. |
| Production APIs | `api/`, Vercel Hobby | 12 standalone API functions currently. Do not add a 13th. Shared `_*.js` helpers are not distinct routes. |
| Printify safety | `api/printify-connection.js`, previous authenticated shop check | API token enumerated 'My new store', not proven to control the existing DelaCosta Pop-Up Store. Gate all publish and purchase links until verified. |
| Production cron | Vercel non-decrypted env inventory 2026-10-27 | `CRON_SECRET` scoped to preview only, while `vercel.json` schedules `/api/indexnow-sync`; investigate/repair before claiming production indexing works. |
| Retained operational data | `docs/data-architecture.md` | Printify = checkout source of truth; Blob = private intake/operations; Supabase = potential future relational apps, not public storefront request path. |
| Configuration drift | `docs/vercel-target-state.json` | Stored research date 2026-09-20; contains older deployment IDs and phase-2 checklists. Refresh deployment and risk state as a reviewed change. |

### Priority findings (not subjective visual impressions)
**P0 / release safety**
1. Confirm actual DelaCosta Printify account/shop mapping and product publish status before adding a CTA. Never link an unpublished shirt or 'My new store' to the public product page.
2. Keep serverless count <= 12; prefer static content, existing components, build-time metadata, and existing endpoints. Assess consolidation rather than purchasing a bigger plan.
3. Investigate preview-only `CRON_SECRET` against production cron; record actual status after an authorized test.

**P1 / clarity & conversion**
4. Standardize TRST-first brand lockup across home, Work, Shop, product detail, Dispatch and Open Thread; DE.LA.COSTA presented as founding artist / Edition 001.
5. Remove catalog status rules from CSS. Single product record needs `status`, `checkoutState`, actual `printifyUrl`, `campaignId`, `editionId`, `primaryImage`, `backImage`, price verification date, and non-fabricated inventory.
6. Detail pages need explicit garment details, front/back views, clear current price/variant handoff, fulfillment and returns. Since checkout is offsite, label CTA 'View sizes & purchase on Printify' and measure outbound navigation, not phantom purchases.
7. Distinguish four audience journeys: buyer, collector, local contributor, commission partner. Give each one primary entry point and matching CTA; avoid equal-weight blocks without a visual hierarchy.

**P2 / design quality & performance**
8. Move beyond mostly Arial + basic token palette; add a deliberate editorial typographic hierarchy and image rules while respecting existing logo/art.
9. Use consistent cropping, aspect ratios, media metadata, readable captions and a flexible 12-column system. Reserve generous negative space for artwork.
10. Record proper Core Web Vitals field readings rather than inventing PageSpeed scores. Optimize hero LCP, fixed image dimensions, and mobile navigation/button ergonomics.
11. Audit contrast, reduced motion, accessible modal focus/escape, semantic headings and error states per WCAG 2.2 AA.

## Comparable design systems — lessons, not copying
| Reference | Observed behavior | TRST adaptation |
|---|---|---|
| Brain Dead — https://wearebraindead.com/ | Campaigns, collaborations, shopping, and cultural programming are distinct linked surfaces. | Give each release a campaign chapter; maintain a direct purchase path and a separate community-events path. |
| Patta — https://patta.nl/pages/community | Community initiatives and creative culture sit next to retail rather than being disguised as product ads. | Make Open Thread an accountable permanent city archive, with consent/credit and optional artifact drops. |
| Aimé Leon Dore — https://www.aimeleondore.com/ | Strong restrained brand presentation and lookbook conventions. | Borrow the idea of disciplined editorial spacing and product photography—not its branding, fonts or layouts verbatim. |
| Noah — https://noahny.com/ | Product collections coexist with lookbooks, editorial, information and brand context. | Establish clear separate Shop, Archive, Journal and Studio routes with connective links and trust information. |
| Shopify design research — https://www.shopify.com/blog/product-page | Strong detail pages show price, imagery, options, availability and policy detail. | Improve TRST detail page before increased paid traffic. |

These are qualitative structural comparisons, not evidence of superior conversion rates or projected revenue.

## Chosen direction: Living Archive / Edition House
**Core proposition:** 'The work comes from somewhere. The edition carries it forward.'
**Brand hierarchy:** TRST Studios = independent creative platform; DE.LA.COSTA = founding visual practice / Edition 001; Open Thread = participatory city archive. Use original lockup asset `public/brand/de-la-costa-trst-studios-logo.png` only where its provenance and correct edition identity fit; do not fabricate replacements.

**Art direction:** Archival editorial; confidence without luxury mimicry. Ink `#0b0b0b`, paper `#fffdf8`, muted stone `#6b645b`, signal red `#c72d26` inherited from existing tokens; campaign-specific deep indigo `#173b59` can appear only as an intentional accent for the approved blue artwork release, not as an arbitrary global recolor. Display grotesk with tight, strong headings; neutral body; mono metadata; very limited expressive serif accents. Prefer local/open-source web fonts if loaded; ensure fallbacks. No generic graffiti overlays, invented logos, fake 'sold out' urgency, or fabricated social proof.

**Grid & composition:** Desktop max 1440px, 12 columns, 24px gutters, section spacing 64–144px, split text/image sections at 5/7 or 4/8 columns; mobile 4 columns and 16–20px gutters. Hero may be asymmetrical: immersive image or video still with a side-aligned title/CTA on paper. Product grid 3 across desktop, 2 tablet, 1–2 mobile depending legibility. Cards use a 4:5 photographic frame, front/back toggle with keyboard access. Open Thread chapters use a photo-first map/list editorial hybrid (do not introduce geolocation dependence).

**Motion:** editorial, subtle; 160–280ms transitions; no forced parallax or autoplay audio. Respect `prefers-reduced-motion`.

**Navigation:** TRST logo / Work / Editions / Open Thread / Journal / Studio, with mobile menu and compact 'Explore Edition 001' action. Place Partners, Artist, policy and contact in Studio/footer or secondary menu, not competing equally in hero. Exact labels can be tested.

## Site map / content experience
- `/`: ONE featured issue with primary CTA, then 'Collected Work' (2 pieces), 'Latest Edition' (1–3 verified products), 'Open Thread' (latest city chapter), 'Field Notes' (2 editorial posts), single Dispatch signup. Avoid ten artworks before the current drop.
- `/work`: Curated portfolio with series filters, an editorial index and request-to-collect flows; show status 'Inquiry' if price not known.
- `/work/:id`: Full-bleed art, provenance/context, captions, materials/size if confirmed, collector CTA, related journal and wearable edition if legitimately linked.
- `/editions` or `/shop`: Preserve `/shop` URL; editorial capsule landing followed by accurate products. Edition cards distinguish LIVE, PREVIEW, ARCHIVED with a real status field.
- `/shop/:id`: Product gallery (front/back/details), summary, fit/policy, price, available color/size communicated by Printify, off-site checkout indication, relevant work context; no dead CTA.
- `/open-thread`: Mission, latest city chapter, contribute, curated outputs, transparency and consent. Participation is not contingent on purchase.
- `/journal`: Field notes, behind-art notes, process, campaign recaps; connect to appropriate Work/Shop pages.
- `/about` and `/partners`: Credibility and commission-oriented capabilities, process, case studies, direct inquiry.
- `/operations`: retain private, noindex, outside public nav.

## Reusable component vocabulary
`BrandMasthead`, `EditionStamp`, `EditorialHero`, `SectionIndex`, `WorkPlate`, `ChapterCard`, `EditionProductCard`, `ProductDiptych`, `ProvenanceStrip`, `JournalTeaser`, `ConsentAwareContribution`, `StudioInquiry`, `DispatchSignup`, `FooterIndex`.
These are conceptual design components, not existing implementation exports.

## Behavioral measurement model
- `home_hero_cta`, `work_detail_view`, `work_inquiry_submit`, `edition_view`, `product_detail_view`, `printify_outbound`, `open_thread_view`, `open_thread_submit`, `dispatch_signup`, `partner_inquiry`.
- Preserve UTM attribution and route/source; consent and privacy rules apply. A Printify outbound click is NOT a completed purchase.
- North-star split: qualified revenue signals (verified orders, product-to-store clickthrough) + cultural/community signals (permissioned contributions, repeat chapter engagement) + creative services signals (qualified inquiries).

## Technical blueprint (no added serverless functions)
1. Freeze approved brand/artwork masters and record checksum/asset source; never regenerate the pocket logo as the back illustration or vice versa.
2. Keep React/Vite/Bun and existing static route HTML generation. Use build-time manifest for editions, products, works, stories, chapters. No new runtime endpoint necessary for redesigned public pages.
3. Introduce a typed-schema-ready data manifest with editorial metadata, publication status, related content, and dates. Validate during build; publish only if checkout is verifiable.
4. Preserve Printify as external payment/fulfillment authority. Never store card data in Vercel/Supabase. Keep server-side credential segregated from `VITE_` variables.
5. Split oversized CSS into tokens/layout/components/pages over time, retaining compatibility. Retire `:has(... Cheo's World ...)` hiding rule when status logic is explicit.
6. Prefer prebuilt compressed product imagery (AVIF/WebP + responsive `srcset`) for public marketing media when licensing and export permit. Keep protected private records behind Blob endpoints.
7. Maintain route titles, canonical and structured data from a single product/story status model. Index only verified live products; archived items need an intentional policy.
8. Preserve Vercel protected preview; compare screenshot at desktop 1440px, tablet 768px, mobile 390px, keyboard path, scroll, slow network, print handoff, and errors before promotion.
9. Retain rollback to previously READY deployment. Design-only changes require zero extra functions; production publish gated by verified preview and human approval.

## Objective release gates
- **Functional:** all primary routes load and correct 404 behavior; valid product handoff goes to correct DelaCosta store; all products named in metadata have a matching live/preview status.
- **Design:** exact approved TRST identity in every logo position; no unauthorized edits to art; no incoherent alternate shell; 390px mobile composition and 1440px desktop approved.
- **Accessibility:** WCAG 2.2 AA target; visible focus, meaningful link names, captions/alt, skip link, escape and return focus in dialogs, readable touch targets.
- **Performance:** evaluate LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at p75 real-user data when volume allows; collect Lighthouse lab baselines separately, do not claim a measured score without running it.
- **Trust:** published price/variants/policies/availability verify against actual shop; unverified Printify credentials cannot authorize public releases.
- **Operations:** <= 12 Hobby functions, no public secret leakage, CRON_SECRET production scope verified, rollback steps documented.

## Implementation sequence with low-cost constraint
1. **Foundation / no production UI:** present three Superdesign art directions + faithful current-page reproduction, collect approval on chosen draft. Superdesign canvas generation requires a successful authenticated CLI session; not completed as of this report.
2. **Structure:** consolidate shell/branding, route states, content manifest and accessible navigation; preview only.
3. **Conversion:** Shop/product galleries with verified off-site handoff and launch-state badge. No artificial checkout implementation.
4. **Editorial:** staged home Work, Open Thread, and Journal narrative sections using reused components.
5. **QA & release:** test all route/link/device conditions, production env and rollback. Promote approved commit only.

## Research and accuracy notes
- Public page extraction can reflect a stale cached homepage, while GitHub's current `src/main.jsx` definitively renders `HomeCover` on the default route. Visual layout findings therefore require screenshot testing in a browser before claiming pixel-level QA.
- Competitive design comparisons are design-pattern research, not performance benchmarks.
- Sources: https://wearebraindead.com/ ; https://patta.nl/pages/community ; https://www.aimeleondore.com/ ; https://noahny.com/ ; https://www.shopify.com/blog/product-page ; https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ ; https://web.dev/articles/vitals .
