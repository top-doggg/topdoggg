# TRST Studios — Superdesign Creative Direction and Canvas Handoff
**Design target:** Existing production React/Vite site `https://trststudios.online`
**Date:** 2026-10-27 | **State:** Ready for authenticated Superdesign canvas, NOT a generated canvas draft
**Read first:** `docs/trst-experience-audit-and-blueprint-2026-10-27.md`
**Source ref:** `top-doggg/topdoggg@trststudios-storefront`

## Original concept, not a fashion-clone
Title: **THE LIVING ARCHIVE**
Motto / positioning direction: *Art from the block. Stories from the people. Editions to carry forward.*
TRST must visually read as a living independent archive with an edition counter, project studies, documentary photographs, and collectible art. Product listing is a clear second movement, not the entire identity. No invented marks, repeated blue mask motif as placeholder for the logo, random graffiti, artificial 'luxury' cues or generic 3D gradients.

The site needs to create three feelings in sequence:
1. **Recognition:** a real place, human history, unmistakable art; distinctive opening frame.
2. **Credibility:** authored work, editorial attribution, transparent cultural participation.
3. **Action:** buy a verified edition, inquire about art, contribute to a community chapter, or commission the studio.

## Directions to compare in canvas
### A — Living Archive (recommended; 70% editorial / 30% commerce)
Warm paper, deep ink, strong photographic cover, section numbering, catalog rails, credible object captions, clear acquisition / shop CTAs. Documentary photography and original painting in architectural white space. Motion behaves like an exhibition index, not a nightclub website.

### B — Street Museum (expressive alternative; 60% culture / 40% motion)
High contrast charcoal/paper, occasional red and campaign blue, cropped image mosaics and oversized edition number, layered newspaper/flyer imagery but refined typographic discipline. Risk: crowding, slower image loads and distracting animated elements. Must obey restrained motion / legibility.

### C — Edition House (commerce-weighted; 45% art / 55% apparel)
Clean, deliberate product photography and drop landing first, portfolio provenance and community narrative after. Risk: early brand might look like another POD shop and undersell cultural distinction.

**Choose A** as baseline. Borrow from B only the human texture of street posters/photography; borrow from C only shoppable product-page clarity. Do not treat these as three completely unrelated brands.

## Brand identity invariants
- TRST Studios is the platform; DE.LA.COSTA the originating artistic practice and Edition 001. Keep exact real website lockup until selected assets have been reviewed.
- Source logo: `public/brand/de-la-costa-trst-studios-logo.png`; do not infer the exact front-shirt print logo is interchangeable with website masthead. The approved silver/blue chest print is a garment-placement identity asset, not permission to redesign the website logo.
- Source palettes from `src/styles/tokens.css`: ink `#0b0b0b`, paper `#fffdf8`, signal `#c72d26`, muted `#6b645b`. Deep blue `#173b59` only for an approved blue-art release highlight.
- Typography idea: confident, wide editorial grotesk for headers; accessible UI sans for body; sober mono for catalog labels/captions. Keep licensing compliant and avoid heavyweight fonts.
- Real approved imagery must be included, not AI-recreated: `public/instagram/coming-back-home.jpg`, `/api/homepage-image?key=grace` (for authorized reference only), approved product shots, selected Work portfolio images.
- Backgrounds mostly paper or black, no busy textures behind small text. Color contrast to WCAG 2.2 AA.
- Prohibit invented endorsements, prices, stock, sales statistics, and fabricated user testimonials.

## Homepage desktop draft prompt (faithful baseline then redesign)
First create an **existing UI reproduction** using the actual `src/main.jsx` branch: `/ ` renders `HomeCover`, which imports `SiteShell`, `home-cover.css`, `site-shell.css` and shared tokens. Baseline structure: text-first header + primary nav, left image/right copy hero (or the actual media/text arrangement seen in CSS), four numbered path links, featured West of the Tracks project image+summary, Dispatch email form, footer. Do not reproduce the old monolithic `Storefront` as the homepage.

After baseline reproduction, **replace** in the same selected concept with:
- Top masthead: real TRST identity left, discreet 'Independent art + editions' subtitle, 5 compact links, one accessible mobile menu and a current edition callout.
- Issue/hero 01: 12-column editorial cover. Documentary imagery occupying 7 columns, headline occupying 5 columns, mini issue stamp 'Edition 001', one primary CTA 'Explore the current edition' and secondary 'View the work'. First fold communicates TRST identity within 3 seconds.
- Issue/hero 02: 'The Work / Selected plates' — two oversized visual objects with understated metadata (series, title, medium/date when confirmed). Click through to Work detail.
- Edition feature: a white and black approved shirt front/back pair on a minimal stone backdrop, no product art edits. 'Blue Smile Now, Cry Later' visible only when actually published; otherwise explicitly marked 'In the studio' with email-first opt-in (no dead checkout).
- City chapter: 'Open Thread — Santa Ana / San Juan Capistrano', one human photo and one selected permissioned text quote or placeholder (never fabricate a contribution). CTA 'Explore the chapter'.
- Studio note: journal teaser aligned with a narrow photo crop and editorial date/author when known.
- Dispatch: one controlled signup band, no immediate aggressive modal or fake scarcity.
- Footer: 3 grouped columns — Explore (work, editions, journal), Participate (open thread, partners), Studio (artist, contact, policy), copyright and origin stamp.

## Mobile draft behavior (390 × 844 viewport)
- True responsive design, not a desktop screenshot scaled down.
- Masthead logo at legible width; menu button with `aria-expanded`, no hidden nav overflow.
- Hero portrait 4:5, headline readable with ~32–42px fluid scale, primary CTA full width, secondary text link.
- Four-page path index becomes 2 × 2 cards or four clean list rows, never tiny tiles.
- Full-width works and a single product card per row. Front/back images both available by tap/keyboard.
- Reduce overlay text on imagery; use separate paper text region.
- Safe tap target 44px is preferred (WCAG 2.2 AA formal minimum may be 24px or spacing exception).
- Product CTA only enables after verify live Printify URL. Explain external checkout visibly.
- No autoplay media with sound; support reduced motion.

## Page-by-page canvas briefs
**Work index:** Intro as an archive index, filter chips by existing series, two-column gallery with intentional varied image sizes, art titles and year/medium only when known, one inquiry pathway.
**Work detail:** 8-column artwork / 4-column story, sticky optional inquiry on desktop only, related Journal and Edition where semantically linked. No wholesale prices invented.
**Shop:** Limited capsule catalog with campaign hero first, then live product cards and accurate price, fit and published badge, customer trust details. Avoid hover-only controls.
**Product:** Split product gallery and purchasing narrative; front/back/close-up; product size guidance and shipping details; Printify off-site purchase label; fallback disabled state if no verified link.
**Open Thread:** Participatory archive, one clear question per city, input consent, transparent source credits, no product CTA before cultural context. Existing contributions may be used only with permission.
**Journal:** Readable article typography and full-bleed photography; clear category/date and related artifacts.
**Studio/Partners:** Selected client/commission case studies and one precise inquiry form; no fictitious partner logos.

## Shared UI components for Superdesign extraction
Extract source-faithful `SiteShell` navigation/footer first; then `EditionStamp`, `WorkPlate`, `EditionProductCard`, `JournalTeaser`, `DispatchForm`, `OpenThreadChapterCard` as reusable canvas components AFTER examining actual source files. Every logo-bearing component must use the exact uploaded asset URL and be audited after generation.

## Interaction guidelines
- Hero image entrance: instant or < 300ms; no giant scroll-jacking.
- Product front/back image switch: click/tap/keyboard, not hover-only.
- Navigable focus, escape/return-focus for overlays, semantic landmarks.
- Editorial text never auto-animates while reading.
- Do not exceed current Vercel 12-function quota; all canvas drafts are static design previews and do not add API routes.

## Exact Superdesign handoff workflow
1. Authenticate Superdesign CLI in an authorized interactive session; no canvas has been created yet.
2. Clone/fetch source for `trststudios-storefront` into a code workspace. Read `.superdesign/resume.json` if present, and create all six init files otherwise (components/layouts/routes/theme/pages/extractable-components).
3. Reproduce **current** homepage from `HomeCover` + `SiteShell` + actual styles first. Verify the rendered branch; do not fabricate missing details.
4. Upload website logo as `--purpose brand --type logo`; upload carefully selected content images as `--purpose content`; upload benchmark screenshots as references (not brand).
5. Create a project titled `TRST / Living Archive — 2026` (or reuse a matching existing project).
6. Generate three art-direction alternatives A/B/C on the canvas; choose A as recommendation and refine by replace, not unrelated forks.
7. Execute connected page flow: homepage → Work → Work detail → Shop → Product → Open Thread → Journal → Studio.
8. Review exact logo placement, route fidelity, mobile, legibility, responsive behavior and accessibility. Gather approval **before** any production implementation.
9. Only after approval, implement a reviewable GitHub PR and Vercel preview. Preserve production until QA passes.

## Acceptance test for the design phase
The result should look like **one collectible editorial universe**, not six visually unrelated websites. A visitor can say in one glance: who made it, what the art means, where to collect, how to participate. Every page retains a deliberate path to the next meaningful action. Brand assets are original. Commercial statuses are verified. Mobile is treated as the primary interaction canvas, not an afterthought.

## CLI gate
The Superdesign CLI ran successfully in an isolated Vercel sandbox but reported `auth: not authenticated`. The subsequent `superdesign login` required browser authorization and timed out without approval. Therefore this file is a **handoff-ready brief, not a claim that a Superdesign project/canvas exists**.
