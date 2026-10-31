# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience is inferred from the storefront, portfolio, and prior TRST brief: collectors and apparel buyers discovering the work, with art directors, partners, and clients as a secondary audience for original-art, licensing, commission, and collaboration inquiries. Visitors should be able to understand the studio, browse the archive and process work, purchase published apparel through Printify, and contact the studio.

## Product Purpose

TRST Studios is the official TRST / DE.LA.COSTA storefront and living archive. It combines an editorial portfolio, apparel collection, portfolio process documentation, journal material, partner information, Open Thread community content, Printify checkout links, and Vercel-hosted lead capture. The primary success outcome is inferred as moving visitors from discovering the archive into a purchase, original-art inquiry, or collaboration inquiry.

## Positioning

The studio connects Southern California community memory, place, and lived experience to independent illustration, hand-painted art, apparel, branding, and editorial storytelling. The site is both a record of the work and a direct path to carrying selected work into daily life.

## Operating Context

The site is a responsive React/Vite web application built and deployed with Bun and Vercel. Public surfaces include the homepage, portfolio and process, work archive, shop and product pages, Open Thread chapters, partners, journal, about, and fulfillment policy. Printify handles product configuration, payment, shipping, and fulfillment. Vercel Functions and Vercel Blob support owned lead-capture and operational endpoints. Supabase is reserved for owned experiences and is not currently part of the public storefront request path.

## Capabilities and Constraints

- Product records and published catalog facts live in the canonical content registry; do not invent products, prices, availability, testimonials, or customer claims.
- Printify is the commerce system of record. The site must not collect card numbers, payment credentials, or other sensitive payment data into Supabase.
- Portfolio process work distinguishes sketches, studies, applications, mockups, and published products accurately.
- Preserve responsive behavior, keyboard-accessible dialogs and controls, direct navigation, and the existing public route structure.
- Keep production domains at `trststudios.online` and `www.trststudios.online`.
- Unprovisioned privileged Supabase and commerce secrets remain empty; never invent placeholders or expose credentials in source, documentation, or chat.

## Brand Commitments

- Existing identity: TRST Studios / DE.LA.COSTA.
- Preserve the Southern California, community, memory, and independent-studio voice confirmed for this project.
- Keep the black, near-black, white, and red editorial visual language unless a future brief explicitly changes it.
- Keep portfolio areas distinct: illustration; hand-painted works and art; clothing, branding, and design.
- Prefer an editorial archive and connected portfolio sequence over repetitive galleries, duplicate imagery, or filler sections.

## Evidence on Hand

- Current product and route records in `src/content/` and `src/app/routes.js`.
- Curated portfolio assets and source mapping in `public/portfolio/` and `docs/portfolio-assets.json`.
- Portfolio and catalog release notes in `docs/portfolio-release.md`.
- Existing application copy, navigation, API boundaries, and deployment configuration in the repository.
- Production domains and deployed routes are live; future claims should be checked against the deployed site rather than inferred from a local build.
- No invented testimonials or external proof should be added without source evidence.

## Product Principles

1. Let the work lead; the interface should frame the archive without competing with it.
2. Connect discovery to a clear next action: collect, inquire, collaborate, or continue through the archive.
3. Treat community memory and place as lived context, not decorative marketing language.
4. Keep commerce factual, transparent, and delegated to Printify for fulfillment.
5. Reduce repetition and preserve meaningful distinctions between portfolio, apparel, process, and studio surfaces.

## Accessibility & Inclusion

Preserve responsive layouts, semantic controls, keyboard-dismissable dialogs, descriptive image alternatives, visible focus and action states, and readable contrast while retaining the established editorial identity.
