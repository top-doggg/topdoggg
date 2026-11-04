# TRST Creative Lab — isolated development track

Created 2026-11-03 as a separate creative development track for TRST Studios and local Codex/Agent Desktop experiments.

## Resources
- Vercel team: `top-dogg`
- New Vercel project: `trst-creative-lab`
- Project ID: `prj_V9iw0svtxOiCRWlutdk7oaFhClb8`
- GitHub: `top-doggg/topdoggg`
- Branch: `creative/trst-studio-lab`
- Based on `codex/trst-creative-handoff`, preserving its root `AGENTS.md` and `docs/trst/` context.
- Upstream local desktop tool: `vercel-labs/agent-desktop`, to run only on a user-authorized Windows computer, not Vercel Functions.

## Deployment rules
This new Vercel project was created with preview deployments **disabled** and Vercel SSO protection enabled for all deployments. It has **no custom domains** and no deployment yet. It must not inherit or move `trststudios.online` from the current storefront projects.

The source linked to the TRST projects is sparse on `main`; avoid deploying this repository until the real website source is reconciled. GitHub branches do not independently create a new production Vercel app. Follow the verified audit in `docs/trst/VERCEL_INTEGRATION.md`.

Before enabling preview builds: reconcile source, add a runnable application to a tracked branch, set appropriate project branch deployment behavior, then run build/checks and test a protected preview URL. Do not import production secrets without user authorization.

## Creative work
Preserve the existing TRST campaign and garment designs. Build independent explorations for the hand-drawn dual-face heart, artist portfolio/process, and marketing previews. Keep all originals and drafts versioned, with human review prior to release.

## Working tree
```bash
git fetch origin
git switch --track origin/creative/trst-studio-lab
```
