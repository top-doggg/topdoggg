# TRST Studios — Full functional integration review

Date: 2026-11-08 (Pacific). Target PR: #11, `chore/impeccable-baseline` → `trststudios-storefront`.

## Release lineage

The older storefront base at `ee14b55` predated the verified production creative source at `9a5f898`. Before promoting Impeccable, merged the complete `creative/trststudios-site-lab` branch into the integration worktree (merge `47fec8e`) to retain production media, private storage routes, product-size fixes, Front/Back gallery corrections, operations and community improvements. Release and credential boundaries are documented in `docs/trst/ROLLOUT_2026-11-03.md`.

The interaction checker compares against the newer trusted production ancestor `9a5f898` only when the target branch predates it; future PRs compare against the newer storefront branch once it contains the release. This avoids falsely flagging the already verified, intentional Front-button fix and operations loading/disabled-state fix.

## Real browser functional checks — local React/Vite

Playwright Chromium on the actual Vite app, `bun run test:browser`: **17/17 PASS**. A test-created local server runs at `127.0.0.1:5187`; no real customer or subscriber records are created.

- Nine public routes: homepage, shop, work, process, about, journal, partners, Open Thread and fulfillment. Assert HTTP 200, visible main content, expected heading and no JavaScript exceptions.
- Home **Explore the work** CTA retains its `href="/work"` and actually navigates to Work.
- Mobile Menu toggles `aria-expanded`, exposes navigation and navigates to Shop.
- Keyboard Skip to content receives focus and navigates to the content anchor.
- Shop Quick View opens; Front / Back image alternates; XL selection activates; Escape dismisses dialog.
- Product detail keeps external secure-store link and shipping/returns policy route.
- Direct Work, Journal and both Open Thread chapter deep links render.
- Dispatch form POST payload is checked against an intercepted `/api/subscribe` response; this test **does not** write a production subscriber.
- Seven core public routes have no document horizontal overflow at 340 CSS px.

## Source and security checks

- `bun run test`: **7/7 PASS**, including operational authentication boundaries, non-configured service disclosure, film HTTP range handling, media file signature checks, and catalog asset IDs.
- `bun run test:interaction-contract`: **10/10 PASS**.
- `bun run verify:interactions`: **PASS** against trusted release lineage (19 baseline React files).
- `bun run build`: **PASS**; nonblocking VideoObject metadata warning for `4-the-town` remains.
- The deliberate negative test that removed the `Explore the work` link's `href` and `onClick` produced exactly two blocking findings; the test mutation was reverted immediately.

## CI and promotion gates

`.github/workflows/impeccable-review.yml` keeps cosmetic detection advisory but makes React interaction comparison and actual browser functional testing **blocking**. The PR cannot merge until required checks pass. The GitHub Creative Lab workflow also runs integration source tests and build.

Impeccable's deterministic demonstration generator was previously observed deleting `href` and `onClick` from accepted HTML; the test source was reverted. The installed guard prevents this specific source regression from being silently merged; it does not prove arbitrary state-dependent callback behavior or third-party commerce functionality.

## External provider limits

No real purchase, live email, new permanent subscription, or sensitive operations request was submitted during browser testing. Printify management credentials and Resend outbound email setup are separate provider issues. Production must be built with **production environment variables**, not by promoting a preview build that may use isolated Lab storage or preview settings. Post-deployment checks should confirm HTTP responses, production media, and existing public domains.
