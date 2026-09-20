# TRST SEO / AI Discovery Technical Specification

## Objective
Build a durable discovery system for TRST Studios / DE.LA.COSTA that helps search engines, visual search systems, and AI-search products understand the artist, studio, projects, places, journal content, film, and commerce surfaces without generating thin or artificial SEO pages.

## Entity model
- Person: Jorge S. Ruiz, artist identity DE.LA.COSTA.
- Organization: TRST Studios, the publishing / production / documentation platform around the practice.
- CreativeWork: project and artwork pages.
- CollectionPage: work archive, journal index, shop collection, Open Thread hub.
- ProfilePage: /about, focused on Jorge S. Ruiz / DE.LA.COSTA.
- Place: use only where the work actually documents a real location.
- VideoObject: add only when required factual fields such as first publication date and a crawlable thumbnail are verified.
- Product: add on individual product pages when a dedicated crawlable page accurately represents the purchasable item.

## Phase 1 — Discovery foundation
1. Every indexable route ships route-specific title, description, canonical, robots directives, Open Graph data, Twitter data, and JSON-LD in the initial HTML.
2. /operations and /wholesale remain noindex at HTML and response-header levels.
3. robots.txt explicitly permits OAI-SearchBot and publishes the sitemap.
4. Homepage identity graph connects Jorge S. Ruiz / DE.LA.COSTA, TRST Studios, WebSite, and WebPage with stable @id values.
5. Project routes expose CreativeWork JSON-LD connected to the artist and website.
6. /about exposes ProfilePage JSON-LD centered on the artist.
7. Collection and policy routes expose accurate CollectionPage or WebPage data. Never fabricate ratings, addresses, events, products, or dates.
8. Acquisition telemetry classifies direct, search, social, referral, campaign, and AI traffic without collecting email addresses, full external URLs, or personal content.
9. ChatGPT referral recognition supports utm_source=chatgpt.com and chatgpt.com referrers.
10. SEO changes preserve the existing visual design and private Vercel media architecture.

## Phase 2 — Content graph and publishing automation
- Centralize projects, artworks, journal entries, films, products, places, exhibitions, and press in structured content records.
- Generate sitemap, metadata, structured data, RSS, related-content links, and freshness dates from those records.
- Add individual Journal routes with BlogPosting structured data.
- Add VideoObject for 4 The Town only after uploadDate and thumbnail facts are verified.
- Add individual product routes before merchant Product markup.
- Implement IndexNow on publish/update/delete with a site-owned key and abuse-resistant server-side submission.

## Phase 3 — Measurement and growth loop
- Connect Google Search Console and Bing Webmaster data when available.
- Expand telemetry to project views, film milestones, shop outbound clicks, newsletter conversions, and inquiry actions.
- Build source dashboards for Google, Bing, ChatGPT/AI, social, referral, newsletter, and direct traffic.
- Detect high-impression/low-CTR pages, orphan content, weak internal links, high-engagement topics, and AI-referred landing pages.
- Use findings to guide original editorial work; never mass-generate doorway pages or keyword-stuffed articles.

## Guardrails
- Original work and firsthand context outrank keyword volume.
- Automation generates technical metadata and distribution signals, not fake editorial authority.
- Structured data must match visible page content.
- No invented locations, credentials, press, dates, reviews, ratings, or availability.
- Public/internal boundaries are architectural, not cosmetic.
- SEO changes must pass build validation and live-route verification before production promotion.
