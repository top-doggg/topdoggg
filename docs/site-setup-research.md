# TRST site setup research

Date: 2026-10-31

## Recommendation

TRST should operate as an **artist-led studio platform with four explicit visitor intents**, not as a general-purpose portfolio or a storefront with an art section:

1. **Shop Edition 001** — buy a current wearable edition.
2. **Collect or license** — view original work, editions, exhibitions, or licensing options.
3. **Bring a project** — start a commission, partnership, or public-project conversation.
4. **Enter Open Thread** — participate in the community archive.

The homepage should explain the relationship between DE.LA.COSTA (the artist practice) and TRST Studios (the platform), present these intents immediately after the hero, and then prove the work through selected projects, process, and Dispatch. The global shell should remain one platform with controlled editorial variation.

## Research findings

- Homepage guidance favors a clear value proposition, obvious primary actions, and content that helps visitors choose what to do next rather than making them infer the site's purpose [1].
- Ecommerce guidance favors product pages that answer decision questions close to the purchase action: what the product is, how it fits, how it is made, what it costs, and what happens after purchase [2][4].
- Ecommerce homepages should make the major product categories and paths discoverable without forcing users to understand the company's internal structure first [3].
- Product structured data can make product details eligible for richer search presentation when the markup matches the visible page content [5].
- Artist-website guidance consistently treats a clear biography, representative work, contact path, and current opportunities as core trust infrastructure for professional visitors [6].

## Applied changes

- Reframed the homepage path grid around the four visitor intents above.
- Made Shop Edition 001 the hero's primary action while retaining a direct Work path.
- Added an evidence strip near the intent choices: independent artist, made after order, secure Printify checkout, and studio inquiries.
- Reordered the global navigation around the visitor journey: Shop, Work, Process, Partners, Open Thread, About.
- Added active-route state and `aria-current` to the shared shell so visitors can recognize where they are.
- Added visible product trust facts and Product JSON-LD to product detail pages, using only the existing catalog values and Printify checkout behavior.
- Consolidated public typography into shared TRST font tokens rather than repeating page-specific font declarations.

## Measurement plan

The audience is still a hypothesis. Keep the four paths measurable for 30 days before narrowing the platform to one audience. Compare:

- `shop_product_view` → `shop_outbound`
- artwork inquiry open → artwork inquiry submission
- partner page view → partner inquiry submission
- Open Thread page/chapter view → contribution
- Dispatch view → successful signup

Do not treat raw traffic as audience proof; use qualified actions and completed outcomes.

## Sources

[1] Nielsen Norman Group — Homepage Design Principles: https://www.nngroup.com/articles/homepage-design-principles/

[2] Nielsen Norman Group — Ecommerce Product Pages: https://www.nngroup.com/articles/ecommerce-product-pages/

[3] Nielsen Norman Group — Ecommerce Homepages and Category Pages: https://www.nngroup.com/articles/ecommerce-homepages-listing-pages/

[4] Baymard Institute — Ecommerce UX Audit: https://baymard.com/blog/ecommerce-ux-audit

[5] Google Search Central — Product Structured Data: https://developers.google.com/search/docs/appearance/structured-data/product

[6] Arts Midwest — What You Need to Build an Artist Website: https://artsmidwest.org/resources/guides-tools/what-you-need-to-build-an-artist-website/
