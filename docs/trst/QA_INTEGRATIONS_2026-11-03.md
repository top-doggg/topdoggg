# TRST — integration and website QA, November 3, 2026

## Current result
**Not ready for a production completion claim.** Source build and four offline checks pass. Live navigation, portfolio lightbox, published Printify catalog, and a cart-to-checkout handoff were exercised. Blob delivery and subscriber storage fail on the live domain. Responsive and product-gallery defects were reproduced and corrected in this branch; browser regression of the changed preview remains required.

This report supersedes the earlier read-only audit in this file. Observations were collected on November 3, Pacific time (November 4 UTC). No orders, signup records, outbound emails, database restoration, production promotion, or credential transfers were performed.

## Exact source and deployment mapping

| Surface | Verified mapping |
| --- | --- |
| Repository / working branch | `top-doggg/topdoggg`, `creative/trststudios-site-lab`; starting SHA `7ace34d11b054292daeb1538292e2e05bc32cdb6` |
| Live custom domain | `trststudios.online`, project `prj_aBlXRunfVCyeMv5X9rNGVDx8O9WN` |
| Actual live deployment | `dpl_BLBxGBE21f2fer9o4BW2y85bShMF`, source ref `port/trststudios-selective`, SHA `fde2abe29239f210260ee61d89876708e4343915`, source `cli`, target `production` |
| Creative project | `trst-creative-lab`, `prj_V9iw0svtxOiCRWlutdk7oaFhClb8` |
| Creative deployment at audit | `dpl_2LD9SBpULwAmgHj2sQ4jHWxncuQE`, SHA `7ace34d11b054292daeb1538292e2e05bc32cdb6`, READY, source `git`, target null, Vercel SSO enabled |
| Integration-bearing older project | `trststudios-replacement`, `prj_Xw4luLyt6S4aETmvQ1JhZHzlhIUH`; does not serve the current custom domain |
| Review | Draft PR [#10](https://github.com/top-doggg/topdoggg/pull/10), creative branch → `trststudios-storefront` |

**A project's latest READY build is not necessarily the deployment serving its custom domain.** The creative branch and live source are different. Do not promote the creative branch on the assumption that it is the current live commit.

## Verification matrix

| Requirement | Observed evidence | Status / remaining work |
| --- | --- | --- |
| Homepage | Hydrated live page, CTA links, primary/footer navigation observed at 1363 CSS px; narrow homepage inspected at 340 CSS px | PASS for observed shell; static image decode timing not exhaustively checked |
| Navigation | Clicked Shop, Process, Work, brand-home; mobile Menu opened and Work navigation completed | PASS for exercised paths; seven public HTTP shell routes returned 200 |
| Portfolio | Process has six projects; Never Alone lightbox opened with decoded image and dismissed by Escape | PASS for exercised desktop lightbox; all curated archive/process source assets exist |
| Mobile layout | Browser zoom created 454- and 340-CSS-px responsive viewports. At 340 px: Work widened to about 381 px; Shop to about 402 px. Homepage and Process had no horizontal page overflow in measured state | FAIL on live Work/Shop. Fixes prepared; rerun preview at 340, 390, 720, and 1363 px. This was responsive desktop-browser testing, not iOS/Android device emulation |
| Product gallery | De Los Cielos front/back worked. Realest Feeling Front button still selected back image because handler reused `previewView` | Reproduced and corrected in creative source; changed preview click test pending |
| Blob homepage | All seven allow-listed keys returned 500 on live HEAD probes | FAIL |
| Blob profile / film | Both returned 500 on live HEAD probes | FAIL; range playback not proven |
| Subscriber storage | GET `/api/subscribe` returned `configured:false` | FAIL; no subscriber POST or delivery verification performed |
| Operations | Live GET `/api/operations` returned 503; source checks storage readiness before authorized operations | FAIL configuration; not a successful-login test |
| Printify authorization | Anonymous live GET `/api/printify-connection` returned 401 JSON; offline handler test also rejected anonymous request | PASS denial boundary; authenticated admin API remains unconfigured on live/lab |
| Supabase | TRST ref `gvitnxuulucuibvptqsf` reports INACTIVE. No Supabase client/auth calls found in active `src/` or `api/` | INACTIVE / not an active storefront runtime dependency; no Supabase login flow exists to verify |
| Source validation | `npm test`: four passing tests; `npm run build`: passed discovery validation, Vite build, generated route/discovery assets; `git diff --check` clean | PASS; not proof of connected providers |
| Creative CI at starting SHA | GitHub Actions run `41753307178` completed successfully on `7ace34d...` | PASS previous source build; inspect new commit's CI after push |

Browser console inspection of the exercised desktop shop showed extension metadata errors, not an observed application exception. This is not an exhaustive all-page console audit.

## Printify storefront reconciliation

The public [All products](https://delacosta.printify.me/products) page lists exactly the five products shown on TRST, with matching starting prices:

| TRST product | Published Pop-Up product ID | Live starting price |
| --- | --- | --- |
| De Los Cielos | 33676373 | $29.58 |
| The Realest Feeling | 33675910 | $25.99 |
| Capistrano Love | 30805178 | $31.01 |
| No Bad Days For A Warrior | 30290414 | $29.05 |
| Sin Miedo | 30190484 | $29.45 |

De Los Cielos detail rendered six color options and S–5XL. White / M / quantity 1 was added to a temporary cart. Printify showed $29.58 plus $5.35 estimated shipping, total $34.93, and reached the checkout contact screen with that item. No contact, address, payment, terms acceptance, or order submission followed. The temporary test item was removed and Printify confirmed the cart was empty. Final taxes and shipping remain destination dependent. Catalog publication and this one orderable variant do not prove availability of every color/size combination. The frontend size selector is explicitly a reference and does not transfer a chosen variant to Printify.

Printify's own header exposed an `undefined logo` label and footer `Eco Essentials`; store branding should be reconciled in Printify. No branding settings were changed.

## Configuration root cause and isolation decision

Environment names and scopes were inspected without decrypting values:

- Live site: only `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, production scope.
- Creative Lab: zero configured environment variables.
- Replacement: `BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID`, `PRINTIFY_API_TOKEN`, `PRINTIFY_ADMIN_SECRET`, `VITE_PRINTIFY_STORE_URL`, and preview `CRON_SECRET` entries.
- Blob store `store_UM16dCIx7fpsssNf`, named `trststudios-subscribers`, is private, available, not quota exceeded, token not expired, and connected only to the replacement project. Metadata reports 16 objects. Individual object paths/content were not read, so their presence is not assumed.

The active store includes subscriber storage as well as intended media. Connecting its read-write credential to Lab would also expose production records and let preview forms write there. Recommended concrete setup: **an isolated private Lab store containing only the nine allow-listed media objects (seven homepage images, profile, film), with preview intake stored separately from production records**. Confirm that isolation choice before moving private assets or credentials across projects. Do not restore the unrelated paused Supabase database merely to make a dashboard green.

A production repair must target the actual custom-domain project, not just the older project holding credentials. Resend/mail and operations access configuration are also absent on live/lab; storage readiness alone does not prove mail delivery or successful private access.

## Source changes in this update

- Front gallery control always selects `front`; `previewView` still determines the initial view.
- Mobile Story and Artist sections use `minmax(0, 1fr)` tracks; archive hero uses a shrinking grid track and headings wrap. This addresses measured intrinsic-width overflow without globally hiding it.
- Footer Instagram URL now matches the approved `_de.la.costa_` account used elsewhere.
- Creative CI runs offline authorization/readiness/curated-asset checks plus existing build checks; its path filter includes tests and routing/build configuration.
- Production deploy workflow refuses its deploy step when manually dispatched from the creative branch.
- `verify:integrations` adds read-only HTTP/MIME/readiness probes that fail on unavailable APIs, incorrect media types, SPA fallbacks, and unconfigured subscriber storage. It makes no purchase or data-write calls.

## Codex development workflow

Work in `top-doggg/topdoggg` on `creative/trststudios-site-lab`; read `AGENTS.md` and `docs/trst/CODEX_STARTER_PROMPT.md`. The actual source is now checked out and changes are tracked on that branch. Do not work from sparse `main` or `creative/trst-studio-lab`.

```sh
bun install --frozen-lockfile --linker hoisted --backend=copyfile
bun run test
bun run build
DEPLOYMENT_URL=https://trststudios.online bun run verify:integrations
```

For a protected deployment supply its automation bypass via the environment, never a committed file or query-string log. The source CI intentionally runs without private provider credentials. A green source build must not be labeled external-integration success. Codex Cloud's account-level environment/default-branch selection is not exposed through the connected tools; it cannot be claimed configured by adding repository files.

## Remaining completion gates

1. Configure isolated Lab media/intake storage and validate actual media bytes, MIME types, film ranges, form persistence, and intended email delivery.
2. Confirm whether Supabase is intentionally retired or a new customer-login feature is desired. Existing storefront operations use their own signed email token flow.
3. Run the changed protected preview in an authenticated browser: gallery Front/Back, narrow layout/overflow, mobile navigation, lightbox, keyboard behavior, portfolio filters, and forms.
4. Reconcile source differences with the actual live ref before requesting production promotion. Re-run live provider checks after an approved deployment.
5. If Codex Cloud is wanted, select this repository/branch in its account UI; repository CI and branch tracking are not account-level workspace provisioning.


## Authorized follow-up application

The user approved the isolated configuration and comprehensive follow-through. Created private Blob store `store_tRNrGd5v6UL65cDA` (`trst-creative-lab-isolated`, iad1) and connected it only to Creative Lab. Exactly nine allow-listed media assets were copied, signature checked, read back, and SHA-256 matched. Store metadata reports nine objects, 23,572,891 bytes. No production subscriber records were copied. Separate Lab operations and unsubscribe signing keys, operations allowlist, and Lab origin were configured; secret values remain outside the repository.

Source checks now cover six cases, including rejecting extra signed-token segments, truthful unavailable-email responses, and valid/invalid film byte ranges. Film metadata now comes from Blob rather than a hardcoded length; invalid ranges return 416, and upstream range mismatches are rejected. Access and unsubscribe email links can use the configured Lab origin. Operations login reports unavailable delivery rather than a false success when Resend is absent.

The Supabase TRST project was rechecked and remains INACTIVE; no new customer-login system was introduced. The stored Printify admin credential is sensitive/non-readable through the connector, so it was neither extracted nor copied into Lab. Public catalog/cart checks remain the verified storefront path. Email provider credentials are not available on Lab: mail delivery cannot be claimed complete.

Further deployed API/browser evidence is recorded below as checks complete. The live domain is not promoted by this follow-up; source differences with its CLI deployment still require reconciliation.


### Follow-up execution evidence

- All four real form handlers (subscriber, artwork, partner, Open Thread) persisted synthetic records to the isolated Lab store. Signed operations GET reconciled the three inquiry records, PATCH saved an approval, and anonymous GET returned 401. The four disposable records were removed.
- Real Blob testing exposed missing `allowOverwrite` on partner/Open Thread delivery-status updates. Corrected both and repeated the three affected inquiry flows, verifying persisted `not_configured` mail status rather than false delivery. Artwork update opt-in metadata now records the actual provider result. Three new test records were removed after the targeted recheck.
- On protected deployment `dpl_28ttPiHAF2pHY9Zxg8RzCsYnbkUr` / source `9f3b519...`, image/profile/film HEAD requests returned 200 with correct MIME types; subscriber GET reported configured true; anonymous operations GET returned 401. Film GET `bytes=0-1023` returned 206, 1,024 bytes, `Content-Range: bytes 0-1023/6732250`, and the expected MP4 signature.
- A browser-driven homepage newsletter signup returned “You're on the list.” Test-only email was used, with email provider deliberately unconfigured. This proves signup storage, not email delivery.
- The Realest Feeling Front/Back controls were exercised in the protected browser: Front selected camera 98445 and Back selected 98446; Escape closed the dialog.
- Work layout measured within its viewport at 681, 454, and 340 CSS px; mobile menu keyboard activation and navigation worked. Process, Partners, and Open Thread fit the measured 340-px viewport. Follow-up measurements exposed a remaining Shop Open Thread grid minimum and an unbreakable About artist heading; both were corrected without hiding overflow globally.
- The home feature file `public/editorial/full-of-grace.webp` was corrupt ASCII text rather than image bytes. It was removed and HomeCover now uses the verified allow-listed Blob grace endpoint. A full Pillow decode audit found no other invalid public raster files. Added a binary-container source test to prevent text-as-image regressions. Seven tests and the full build now pass.

Final changed-preview checks, CI/deployment identity, and remaining provider limits will be summarized after the final application build.
