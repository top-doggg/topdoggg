# TRST Studios — Codex operating context

This repository is linked in Vercel to TRST Studios projects, but its source completeness has NOT been verified. Do not assume this branch contains the actual deployed website.

Read `docs/trst/CREATIVE_DIRECTION.md`, `docs/trst/VERCEL_INTEGRATION.md`, and `docs/trst/AGENT_DESKTOP.md` before changing anything.

## Creative guardrails
- TRST Studios / De.La.Costa: Chicano neighborhood-rooted experimental art, photography, hand-drawn pencil work, emotional duality, sophisticated streetwear, and lived-in documentary imagery.
- Preserve approved product artwork **exactly**, especially the blue/ivory smiling/crying faces, eye and broken heart on the back of TRST shirts and the small TRST chest logo. Concept images are never proof of DTG or print readiness.
- Heart illustration is a distinct art branch: the **entire outer frame** must read as a heart, with two emotionally contrasting faces, a symbolic eye, geometry and curling forms. Human graphite marks, imperfect pressure and crosshatching; never an ornamental totem with a small heart.
- Streetwear video: authentic Southern California neighborhood scenes, candid adults, practical sunlight, raw miniDV/documentary energy, strong readable shirts, clean hard action cuts, no glamorized stereotypes. Final overlays: TRST STUDIOS / DROPPING SOON / trststudios.online. Never invent drop dates/prices.
- Do not publish identifiable reference photos or upload them into public repositories without release/permission confirmation.

## Engineering guardrails
- **Audit before editing**: Vercel's production deployment and domains, GitHub source mapping, framework, build commands, serverless/edge functions, Blob storage, Printify, Airtable, Auth0, and environment-variable names. Never expose secret values.
- The public GitHub repo `top-doggg/topdoggg` was verified on 2026-11-03 to contain only `.gitignore` and `LICENSE` on `main`. Do not overwrite a working live deployment with this sparse source. Investigate the true production artifact/source first.
- Vercel projects `trststudios.online` and `trststudios-replacement` were both linked to `top-doggg/topdoggg`; do not assume which owns current production routing. Validate domain assignment and production deployment.
- Develop on branches, make small reviewed PRs, verify build and live screenshots, deploy only with explicit user approval.
- Do not commit API keys, tokens, customer data, private photos, or AI-generated product mockups as certified originals. Keep video generation costs explicit.

## Agent Desktop
`vercel-labs/agent-desktop` is an OS-level accessibility-based computer-use CLI/MCP server. It is NOT the website source, NOT a Vercel deployment, and cannot by itself give hosted Codex Cloud access to a user's Windows desktop. Follow `docs/trst/AGENT_DESKTOP.md`; obtain user-granted OS permissions before use. Never upload accessibility snapshots to public logs.
