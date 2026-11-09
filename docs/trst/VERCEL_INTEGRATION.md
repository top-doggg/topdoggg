# Vercel/GitHub reconciliation — audit 2026-11-03

Verified via connected Vercel + GitHub read tools; subject to live change.

Vercel team: `top-dogg`, team id `team_3ucEA2CqYmlQcdwNrEDXTSSn`, Hobby plan.

| Vercel project | Project ID | Framework reported | Linked GitHub |
| --- | --- | --- | --- |
| `trststudios.online` | `prj_aBlXRunfVCyeMv5X9rNGVDx8O9WN` | Vite | `top-doggg/topdoggg` |
| `trststudios-replacement` | `prj_Xw4luLyt6S4aETmvQ1JhZHzlhIUH` | unspecified | `top-doggg/topdoggg` |
| `site` | `prj_oVjeOUpy6cXjd3O29WBynfnfxhJo` | Vite | `RonaldRizz/zod` |

Both TRST Vercel projects reported domain associations with `trststudios.online` and `www.trststudios.online`. This alone does NOT establish the current routing owner.

`top-doggg/topdoggg` is public, default `main`, and its root at time of inspection contained only `.gitignore` and `LICENSE`. Repo may lack current live site code; do not treat it as an authoritative full storefront snapshot.

## Mandatory reconciliation before implementation
1. Verify current Vercel domain ownership and deployment aliases, including which project is truly serving custom domains.
2. Inspect production deployment source/build logs, Git commit SHA, root directory, framework, uploaded build artifacts and Node version. Compare `trststudios.online` and `trststudios-replacement`.
3. Find the actual editable storefront source, which may be in another repo or deployed outside the sparse Vercel-linked repo.
4. Inventory live routes, media storage (Vercel Blob), Printify products, Airtable, Auth0, and serverless function use. Secret names only, never values.
5. Restore/version the confirmed source in an appropriate private repo before adding creative pages, products, campaign visuals or modifying production.
6. Create a preview deployment, test desktop/mobile and product/cart flows, then request approval before promoting to production.

This PR includes **context files only** and intentionally does not change website code, deploy, install packages or modify credentials.

## Correction / discovery on 2026-11-03
**FOUND**: Real storefront source is on `top-doggg/topdoggg` branch `trststudios-storefront`, with `package.json`, `index.html`, `src/`, `api/`, `public/`, `supabase/`, `scripts/`, and Bun lockfile. The site project most recently recorded READY deployment `dpl_CnncHRtjq2bfND7RTFENuUZ8RiS1` built from Git commit `ee14b5576a8fe17a930427c692a66006402aff23` on `trststudios-storefront`. A Vercel domain lookup verified `trststudios.online` belongs to project `prj_aBlXRunfVCyeMv5X9rNGVDx8O9WN`. The `trststudios-replacement` project returned not found for that domain. Use `creative/trststudios-site-lab` as new source-based creative development branch, NOT `creative/trst-studio-lab` which came from sparse main. Keep the original production route undisturbed.
