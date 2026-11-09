---
name: TRST Studios / DE.LA.COSTA
description: Editorial, artist-led Southern California archive and storefront; preserve original artwork, raw documentary imagery, and the established near-black, paper, and signal-red identity.
colors:
  trst-ink: "#0b0b0b"
  trst-paper: "#fffdf8"
  trst-signal: "#c72d26"
  trst-muted: "#6b645b"
  trst-line: "rgb(11 11 11 / 15%)"
typography:
  families:
    sans: "Arial, Helvetica, sans-serif"
    display: "Georgia, Times New Roman, serif"
---

# TRST Studios Design System

## Source of truth

This file records the observed design, not a redesign brief. Actual current tokens are in `src/styles/tokens.css`; component-specific editorial treatments also appear in `src/App.css`, `src/storefront.css`, `src/artist-homepage.css`, and related stylesheets. If a token differs, inspect the implemented surface and update this document rather than silently rewriting production CSS.

## Identity and composition

TRST Studios / DE.LA.COSTA is an independent, Chicano neighborhood-rooted visual practice. Prioritize original art, photography, process, community memory, and sophisticated streetwear presentation. Use editorial sequencing and deliberate negative space. Avoid generic SaaS cards, artificial gloss, stock marketing visuals, or invented testimonials.

## Observed palette

- Ink `#0b0b0b`, paper `#fffdf8`, signal red `#c72d26`, muted `#6b645b`.
- Existing named tokens: `--trst-ink`, `--trst-paper`, `--trst-signal`, `--trst-muted`, `--trst-line`.
- Approved apparel artwork and campaign photography may use their own intentional palettes. Detector color warnings are review prompts, not permission to recolor art.

## Typography and layout

- Base sans is `Arial, Helvetica, sans-serif`; base display fallback is `Georgia, "Times New Roman", serif`. Sections may use contextual condensed editorial display treatments.
- Current spacing tokens are 0.5rem, 1rem, 1.5rem, and 2rem; section gap `clamp(4rem, 9vw, 9rem)`, gutter `clamp(1rem, 5vw, 5rem)`, content max `90rem`.
- Default to square/border-led editorial framing rather than repetitive rounded cards. Preserve desktop and mobile balance.

## Content and interaction rules

- Treat original illustration, source photography, shirt graphics, logos, and their proportions as immutable unless an exact change is explicitly approved.
- Distinguish sketches, studies, product mockups, print-ready assets, and published products.
- Preserve semantic navigation, responsive routes, readable contrast, focus indicators, keyboard-closeable dialogs, and reduced-motion behavior.
- After every Impeccable live-mode accept, run `bun run verify:interactions` and inspect the accepted JSX against the original. Verify retained `href`/routing, React `onClick` and other event handlers, accessible names, keyboard behavior, and any downstream callback implementation. A successful `live-complete` alone does not prove these behaviors survived.
- PR CI includes a **blocking** React interaction contract check against the target branch's base commit. Never suppress it or convert it into an advisory job to merge a live edit; any intentionally changed interaction requires an explicit source-level review and new acceptance tests.
- Printify remains commerce system of record; do not handle payment credentials in this frontend.
- Preserve existing product catalog, prices, domain routing, and current fulfillment links.

## Review policy

- Do not auto-apply cosmetic detection findings to intentional brand typography, grid motifs, documentary material, or artwork. Review and document exceptions narrowly.
- Functional errors, broken assets, inaccessible interactions, mobile clipping, and contrast defects take priority.
- No production deploys, image replacements, or irreversible changes without separate approval.
