# TRST Studios — Discovery Layer 3 Specification

Researched and staged: 2026-09-20

## Release baseline

Phase 2 is production:
- Vercel production deployment: `dpl_HAc8yEJ3FkmJjKVnmvKGvE6rgp6m`
- Production source commit: `5ef364911bffc33a9ee4d893eaa7be9474d68dda`
- Public aliases: `trststudios.online`, `www.trststudios.online`
- State: READY
- Runtime errors at verification: none
- Journal detail routes, CreativeWork routes, RSS, sitemap, robots, media endpoints and IndexNow authentication gate all respond correctly.

## Layer 3 principles

1. Add only structured data that matches visible, verified facts.
2. Dedicated canonical pages precede page-specific rich-result markup.
3. Do not infer dates, inventory, availability, ratings, reviews, SKUs, GTINs, shipping promises, or product variants.
4. Acquisition telemetry uses aggregate attribution context and never stores full referrer URLs or personal identifiers in analytics events.
5. Search-performance feedback is read-only and separated from publishing/deployment authority.

## A. BreadcrumbList — approved and implemented

Google requires a BreadcrumbList with ordered ListItem entries. Breadcrumbs should describe a normal user path, not mechanically mirror the URL.

TRST hierarchy:
- TRST Studios → Work → work title
- TRST Studios → Journal → dispatch title
- TRST Studios → Open Thread → chapter
- TRST Studios → top-level page

Implementation is build-time JSON-LD in `scripts/seo-schema.mjs`. This keeps breadcrumb markup in initial HTML and aligned with canonical route metadata.

Validation gate:
- build READY
- inspect generated JSON-LD
- no duplicate or malformed context
- test representative Work, Journal, Open Thread and top-level pages

Official reference:
https://developers.google.com/search/docs/appearance/structured-data/breadcrumb

## B. VideoObject — schema designed, publication blocked on factual verification

Current verified video delivery facts:
- title/work reference: `4 The Town`
- content endpoint: `https://trststudios.online/api/film`
- media type: `video/mp4`
- byte-range delivery: supported
- source object: private Vercel Blob `media/4thetown-web-complete.mp4`

Google-required VideoObject facts not yet verified:
- exact public `name` wording
- `thumbnailUrl` for a stable crawlable thumbnail
- `uploadDate` / first-publication DateTime

Recommended facts to verify:
- unique description
- duration in ISO 8601
- stable watch-page URL
- content URL (the existing `/api/film` endpoint is a candidate only after crawlability is confirmed)

Do not emit VideoObject until all required facts are verified. Never substitute a file creation date or Git commit date for uploadDate.

Official reference:
https://developers.google.com/search/docs/appearance/structured-data/video

## C. Dedicated product URLs — approved architecture, markup gated

Active product IDs:
- `capistrano-love`
- `no-bad-days`
- `sin-miedo`

Retired commerce product:
- `cheos-world` — must not return to active commerce.

Target canonical pages:
- `/shop/capistrano-love`
- `/shop/no-bad-days`
- `/shop/sin-miedo`

Each page should visibly contain the same facts later represented in structured data:
- product name
- approved front/back images
- artist/brand context
- product story
- fit
- displayed current price
- clear checkout destination
- fulfillment-policy link

Current checkout is an external Printify Pop-Up Store. Google Merchant Listing guidance says merchant-listing eligibility is for pages where the shopper can purchase the product, not pages that merely link to another site that sells it. Therefore do not claim Merchant Listing eligibility on TRST pages until the purchase model is verified against this requirement.

Product/Offer markup remains blocked until these are verified:
- current active offer price at release time
- currency
- actual availability
- seller identity / purchase relationship
- variant model (sizes and any price differences)
- whether TRST's page itself qualifies as the purchase page for the intended Google feature

Do not add AggregateRating, Review, SKU, GTIN, MPN, inventory quantity or shipping estimates unless independently verified.

Official references:
https://developers.google.com/search/docs/appearance/structured-data/product-snippet
https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
https://developers.google.com/search/docs/appearance/structured-data/product-variants

## D. Acquisition telemetry — expanded

Existing landing attribution:
- sourceCategory: ai / search / social / campaign / referral / direct
- referrerHost only
- UTM source / medium / campaign
- route and path

Layer 3 event vocabulary:
- `content_view`
- `related_content_click`
- `source_outbound`
- `studio_inquiry`
- existing storefront product/detail/checkout/newsletter events now inherit discovery attribution

Next events, only when the corresponding UI exists:
- `film_start`
- `film_complete`
- `shop_product_view`
- `shop_outbound`
- `dispatch_signup`

Vercel's 2026 Web Analytics API can later provide aggregated visits and custom-event data for reporting.

Official reference:
https://vercel.com/changelog/web-analytics-api

## E. External search-performance feedback — read-only target

Preferred Google source: Search Console API.

Read-only data model:
- date
- page
- query
- device
- search appearance
- search type
- clicks
- impressions
- CTR
- average position

Use `webmasters.readonly` where possible. Do not give a search-performance integration deployment or content-write authority.

The Search Analytics API returns top rows subject to internal limits; it should be treated as performance feedback, not a complete raw search-log stream.

Search Console can also submit/list sitemaps and inspect URL index status. Do not use Google's Indexing API for ordinary TRST pages: Google restricts that API to JobPosting and livestream BroadcastEvent pages.

Official references:
https://developers.google.com/webmaster-tools/v1/searchanalytics/query
https://developers.google.com/webmaster-tools/v1/api_reference_index
https://developers.google.com/search/apis/indexing-api/v3/quickstart

## Layer 3 release order

1. BreadcrumbList
2. acquisition-aware content telemetry
3. dedicated product page routes without premature Product/Offer markup
4. verify live Printify offer facts and purchase relationship
5. add Product markup only to eligible dedicated product pages
6. establish a stable video watch page and verify VideoObject required facts
7. add VideoObject
8. connect read-only Search Console performance feedback
9. compare Search Console data with Vercel acquisition/events
10. iterate metadata/internal linking from observed performance, never by fabricating structured-data facts

## Staging status

Canonical product-route scaffolding and BreadcrumbList/acquisition telemetry are staged on the storefront branch. Product rich-result markup and VideoObject remain intentionally gated by factual verification.
