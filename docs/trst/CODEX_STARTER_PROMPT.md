# TRST Studios — Codex working task

Use repository `top-doggg/topdoggg`, branch `creative/trststudios-site-lab`. This branch contains the actual Vite/React storefront source. Sparse `main` and `creative/trst-studio-lab` are not storefront starting points.

Read root `AGENTS.md`, `docs/trst/CREATIVE_DIRECTION.md`, `docs/trst/VERCEL_INTEGRATION.md`, `docs/trst/AGENT_DESKTOP.md`, and `docs/trst/QA_INTEGRATIONS_2026-11-03.md` before changes. The QA report records the current domain/deployment reconciliation; older memos are historical observations.

Install with `bun install --frozen-lockfile --linker hoisted --backend=copyfile`. Run `bun run test` and `bun run build`. For read-only live checks run `DEPLOYMENT_URL=<origin> bun run verify:integrations`; protected deployments need an environment-provided automation bypass. Never commit or print credentials. Treat offline CI and connected-provider verification separately.

Preserve approved artwork and product imagery. Develop on the creative branch, keep changes in draft PR #10 into `trststudios-storefront`, and use only the protected Creative Lab preview. The custom domain currently serves a different CLI-deployed ref; reconcile it before any production promotion. Never dispatch a production deployment from the creative branch, copy subscriber data into preview, restore Supabase, or transfer credentials without the specific configuration decision required in the QA report.

Account-level Codex Cloud environment selection still requires the account's setup UI; this document and CI do not configure it automatically. Finish the requested changes and report tested behavior and concrete remaining blockers without assuming a READY build means the website is fully functional.
