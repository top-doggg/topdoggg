# Impeccable baseline — TRST Studios

Date: 2026-11-08. Device: top-doggg. Isolated worktree: `chore/impeccable-baseline` at `C:\Users\stadi\TRST\impeccable-baseline`. Source baseline: `origin/trststudios-storefront` (`ee14b55`). No production files were deployed or modified.

## Project verification

React 19, Vite 8, Bun 1.3.14; Node 24.x target; Vercel deployment. `bun install --frozen-lockfile` passed (63 packages installed). `bun run build` passed. Vite dev server returned HTTP 200 at `http://127.0.0.1:5173/`.

Build emitted a nonfatal discovery metadata warning for `4-the-town`: missing `name`, `thumbnailUrl`, `uploadDate`, and `watchPath`. This remains a separate content-quality review item.

## Baseline detector

Installed global Impeccable skill: 4.8.1, engine 0.1.19. Source scan `detect --json src` returned code 2 with **10 total findings**:

- **9** `overused-font` findings (warning; inspect against approved editorial direction before changing typography).
- **1** `codex-grid-background` finding (advisory in `src/App.css`; may reflect intentional graphic language).

Rendered URL detector `detect --json http://127.0.0.1:5173` returned code 0 with an empty list for the tested page. This is not a full manual accessibility audit or cross-viewport visual review.

Baseline raw JSON artifacts are stored locally under `.impeccable/review/` and intentionally excluded from version control.

## Integration and safeguards

`PRODUCT.md` already existed. A brand-preserving `DESIGN.md` has been added from existing product guidance and `src/styles/tokens.css`. Nonblocking PR workflow `.github/workflows/impeccable-review.yml` runs a pinned CLI source scan and publishes JSON as a build artifact without failing the PR for cosmetic findings.

Live-mode local setup uses `index.html` and a CSP check that found no CSP; `impeccable live` boot succeeded with helper on port 8400 and the dev server on port 5173. Automated Playwright verification used local Microsoft Edge at 1440×900 and 390×844. Both loaded the storefront, with no JavaScript exceptions; the mobile viewport had no horizontal document overflow (390px scroll width at 390px viewport). Helper endpoints `/live.js`, `/events`, and `/status` returned HTTP 200 in an authorized browser session. The live picker mounted and clicking the homepage H1 exposed the Freeform/Bolder/Quieter/Polish/Typeset/Colorize/Layout/etc. action menu. A full browser-driven test selected the homepage `a.cover-hero-secondary` element, submitted Go, generated three variants, cycled to variant 2, and discarded; the original JSX was restored. A separate browser-driven session selected the same element, generated three variants, cycled, and accepted variant 2; Impeccable confirmed carbonize cleanup and `live-complete`, with no leftover markers or JavaScript errors. **Semantic regression observed in the deterministic fake-agent variant:** the accepted anchor dropped its original `href="/work"` and React `onClick` handler. This is unacceptable for production; the test change was immediately reverted with `git restore -- src/HomeCover.jsx`, then `bun run build` passed and the worktree was clean. Do not apply live-generated variants to interactive elements until source-level behavior (links and event handlers) has been reviewed. Helper was stopped and injected script removed. Local browser test artifacts: `C:\Users\stadi\tmp\impeccable-browser-qa`.

## Next gate

GitHub Actions PR #11 verified both the advisory `design-review` job and existing `validate-and-deploy` build job as successful; the production-deploy step was skipped. Live picker, generation, cycling, discard, and accept/cleanup have been exercised in an isolated worktree. **Interaction safety gate implemented:** `scripts/check-react-interactions.mjs` compares existing JSX control bindings, navigation and accessibility attributes against the PR base commit; a new blocking `interaction-contract` CI job tests the detector and checks React source before merging. Local tests cover 10 cases, including loss of `href`, `onClick`, form semantics and keyboard handlers. An actual in-place negative test removed the original Explore the work link's `href` and `onClick`; the checker failed with 2 findings, then passed after automatic restoration. The guard is intentionally conservative and cannot guarantee behavioral correctness of callback implementation or external state changes; visually accepted interactions still require functional browser regression testing. Review the design brief and production routing before merging; do not promote a deployment from this draft review.
