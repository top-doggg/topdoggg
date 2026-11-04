# TRST Creative Lab — Integration and website QA (2026-11-03)

## Scope
Read-only verified GitHub storefront source on `creative/trststudios-site-lab`, Vercel project `trst-creative-lab`, deployment `dpl_HRDovKaKFnPivhnV8Bkefq3aW1bS`. The production website is `trststudios.online` in a separate Vercel project. No live production changes were authorized or made.

## Verification matrix

| Area | Evidence | Outcome |
| --- | --- | --- |
| Build/deployment | Vercel READY; Bun 1.3.14 install and Vite build completed | PASS: build only |
| Public shell routes | Protected Vercel fetches of /, /shop, /work, /process, /about returned HTTP 200 with page-specific title/canonical markup | PASS: HTTP/static HTML; JS interactivity not verified |
| Desktop/mobile rendering | Browser navigated to Creative Lab production alias but redirected to Vercel login protection | BLOCKED: must test in authenticated browser |
| Navigation | `src/app/site-navigation.js` defines Shop, Work, Process, Partners, Open Thread, About, plus footer Journal and Fulfillment | CODE EXISTS, clicks not tested |
| Portfolio/process | `src/Process.jsx` and `src/content/processProjects.js` define six projects and image lightbox; `src/Work.jsx` renders portfolio archive | CODE EXISTS; visual QA blocked |
| Static portfolio assets | HTTP 200 from /portfolio/mask-drawing.webp | PASS: one tested asset |
| Static product assets | HTTP 200 from /products/warriors-dance-tee.png | PASS: one tested asset |
| Blob homepage | /api/homepage-image?key=grace returns HTTP 500 | FAIL: no Blob credentials |
| Blob profile | /api/profile-image returns HTTP 500 | FAIL: no Blob credentials |
| Blob video | /api/film returns HTTP 500 | FAIL: no Blob credentials |
| Subscriber intake | GET /api/subscribe responds configured:false, storage:null | FAIL: storage unavailable; no POST performed |
| Supabase | `supabase-trst-online` ref `gvitnxuulucuibvptqsf` reports INACTIVE | NOT OPERATIONAL. Creative Lab currently has no env vars. Storefront appears not to invoke Supabase login directly; admin auth via signed operations token. |
| Printify public products | Code lists six product records (five shown, excluding Cheo's World) with static product links and offsite Printify checkout. | CODE PRESENT; live catalog/stock/checkout unverified |
| Printify API | `/api/printify-connection` requires operations authorization + `PRINTIFY_API_TOKEN`. Lab has no env variables. | NOT CONFIGURED; no authorized API product list validation |
| Vercel runtime | After API probes, three Blob-related grouped runtime errors on this deployment | CONFIRMS failure root cause |
| Codex | Root `AGENTS.md`, creative brief, and `CODEX_STARTER_PROMPT.md` on site-derived creative branch; separate no-deploy CI workflow added | Repository-ready; Codex Cloud workspace selection requires user-side setup |

## Security and configuration
- Creative Lab has **zero environment variables** configured (verified via Vercel, no secret values read).
- Production site project `trststudios.online` has Supabase-related env var names, but the linked Supabase TRST project reports INACTIVE.
- `trststudios-replacement` has Blob and Printify integration env var names; their values were not read or copied. Do not assume it currently serves the custom domain.
- The public custom domain `trststudios.online` was separately probed: its homepage image API also returned 500 and subscriber status configured:false at this observation time. Investigate production routing and existing store ownership before any changes.
- Vercel Login protection blocked unauthenticated interactive/visual QA. Do not disable authentication or publish bypass secrets for convenience.
- The site's generated canonical tags point to `https://trststudios.online` intentionally; do not index Creative Lab as the official site.
- **NEVER copy production private Blob credentials, Printify admin token or Supabase secrets into a public repo or across projects without an explicit access/data-isolation decision.**

## Recommended actions in priority order
1. Link the correct Vercel Blob store to the isolated Creative Lab project using Vercel-managed integration (store already used for production only after verifying owner); prefer a separate preview/test store if writes are involved. Verify `/api/homepage-image?key=grace`, `/api/profile-image`, `/api/film`, and newsletter status.
2. Confirm if the active production Supabase project is needed for storefront traffic. Do not automatically restore a paused database or point preview at production customer records.
3. Confirm Printify product publication, size/stock, current price, images, checkout redirects, and admin API authorization in an authenticated preview environment. Do not place orders or change products during QA.
4. Open a browser authenticated to Vercel and test each desktop/mobile route, layout overflow, navigation, lightbox, modal, cart, image decode, API network results, and accessibility. Document screenshots and browser errors privately.
5. In Codex Cloud select `top-doggg/topdoggg`, branch `creative/trststudios-site-lab`, read `AGENTS.md`; use reviewed PRs into `trststudios-storefront` only after a stable preview and full regression checks.
6. Review whether non-storefront project(s) should auto-deploy this branch; repository is linked to multiple Vercel projects. Do not promote to the live domain without explicit approval.
