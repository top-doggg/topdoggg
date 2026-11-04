# TRST Studios — Codex operating context

This repository contains the verified Vite/React storefront on `creative/trststudios-site-lab`. The user authorized its production rollout on November 3, 2026. Consult `docs/trst/ROLLOUT_2026-11-03.md` and the integration QA report for exact deployed source, project, and rollback mapping.

Read `docs/trst/CREATIVE_DIRECTION.md`, `docs/trst/VERCEL_INTEGRATION.md`, and `docs/trst/AGENT_DESKTOP.md` before changing anything.

## Creative guardrails
- TRST Studios / De.La.Costa: Chicano neighborhood-rooted experimental art, photography, hand-drawn pencil work, emotional duality, sophisticated streetwear, and lived-in documentary imagery.
- Preserve approved product artwork **exactly**, especially the blue/ivory smiling/crying faces, eye and broken heart on the back of TRST shirts and the small TRST chest logo. Concept images are never proof of DTG or print readiness.
- Heart illustration is a distinct art branch: the **entire outer frame** must read as a heart, with two emotionally contrasting faces, a symbolic eye, geometry and curling forms. Human graphite marks, imperfect pressure and crosshatching; never an ornamental totem with a small heart.
- Streetwear video: authentic Southern California neighborhood scenes, candid adults, practical sunlight, raw miniDV/documentary energy, strong readable shirts, clean hard action cuts, no glamorized stereotypes. Final overlays: TRST STUDIOS / DROPPING SOON / trststudios.online. Never invent drop dates/prices.
- Do not publish identifiable reference photos or upload them into public repositories without release/permission confirmation.

## Engineering guardrails
- **Audit before editing**: Vercel's production deployment and domains, GitHub source mapping, framework, build commands, serverless/edge functions, Blob storage, Printify, Airtable, Auth0, and environment-variable names. Never expose secret values.
- The default `main` branch is sparse, but the **actual website source** is on `trststudios-storefront` (Vite/React, src/, api/, public/, scripts/, supabase/, package.json). This creative working branch `creative/trststudios-site-lab` was created from that website branch. The Vercel site project used `trststudios-storefront` for a READY deployment. Use the separate protected `trst-creative-lab` project for ongoing previews. Production rollout is authorized in this session to the existing `trststudios.online` project; preserve its custom domains and production records. Future production releases still require user authorization.
- Vercel projects `trststudios.online` and `trststudios-replacement` were both linked to `top-doggg/topdoggg`; do not assume which owns current production routing. Validate domain assignment and production deployment.
- Develop on branches, make small reviewed PRs, verify build and live screenshots, deploy only with explicit user approval.
- Do not commit API keys, tokens, customer data, private photos, or AI-generated product mockups as certified originals. Keep video generation costs explicit.

## Agent Desktop
`vercel-labs/agent-desktop` is an OS-level accessibility-based computer-use CLI/MCP server. It is NOT the website source, NOT a Vercel deployment, and cannot by itself give hosted Codex Cloud access to a user's Windows desktop. Follow `docs/trst/AGENT_DESKTOP.md`; obtain user-granted OS permissions before use. Never upload accessibility snapshots to public logs.

## Production storage
The public site uses the existing private production media/subscriber store, while Lab has its own isolated store. In production, leave `BLOB_STORE_ID` unset while using the authorized `BLOB_READ_WRITE_TOKEN`: the installed SDK otherwise prefers project OIDC, which is not connected to the legacy store and returns 403. `TRST_PRODUCTION_BLOB_STORE_REFERENCE` is an informational reference, not SDK configuration. Never copy production records into Lab or publish credentials. Email delivery is intentionally deferred by the user.
