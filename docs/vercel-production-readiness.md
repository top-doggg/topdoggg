# Vercel Production Readiness Audit - Hobby Plan

Project: `trststudios.online`  
Plan: Hobby  
Runtime: Vite + React + Vercel Functions + private Vercel Blob

## Already Handled

- Production domain resolves through Vercel and uses HTTPS/HSTS.
- DNS has already moved to Vercel nameservers.
- `bun.lock` is present for pinned installs and faster builds.
- Vercel Analytics is installed and mounted in `src/main.jsx`.
- Intake APIs use private Vercel Blob storage.
- Intake APIs already enforce body size limits and no-store responses.
- CORS is restricted to localhost and `trststudios.online`.
- Vercel deployment from `D:\common_attachment\trststudios.online` succeeds.

## Fixed In This Pass

- Added CSP and security headers in `vercel.json`.
- Added cache headers for hashed assets, product media, Instagram images, and brand assets.
- Added basic per-instance API rate limiting for subscriber and Site Forge intake endpoints.
- Added Function duration and memory limits for Hobby cost control.
- Expanded `.gitignore` to exclude `node_modules`, `dist`, `.vite`, logs, and OS metadata.

## Hobby Plan Gaps / Manual Vercel Dashboard Items

- Deployment Protection: enable Vercel Authentication for preview deployments. Hobby has limited share-link behavior.
- WAF custom/managed rules: dashboard availability is limited compared with Pro/Enterprise. At minimum, review Firewall traffic and add bot/rate rules if available.
- Log Drains: not fully available on Hobby; use Vercel logs and dashboard monitoring unless upgrading.
- Observability Plus: Pro/Enterprise feature. Not available on Hobby.
- Automatic Function failover, Secure Compute passive failover, load testing support, SAML, SCIM, Audit Logs, cookie policy enforcement: Enterprise-only.
- Spend Management: review Hobby usage limits manually in Vercel dashboard.

## Remaining Recommended Work

1. Add a short incident response document with owner, contact channel, rollback command, and customer message template.
2. Confirm preview deployment protection in Vercel dashboard.
3. Review `package-lock.json` vs `bun.lock`; keep one package-manager lockfile if possible.
4. Move heavy product/mockup images to Vercel Blob or optimize them into smaller WebP/AVIF assets.
5. Add uptime monitoring from an external free/low-cost monitor.
6. Add server-side validation for future payment/webhook routes before Stripe launch.
7. Add a simple build/deploy runbook covering preview, production deploy, promote, and rollback.

## Rollback Quick Reference

- List deployments: `npx vercel@latest ls`
- Inspect deployment: `npx vercel@latest inspect <deployment-url>`
- Rollback production: `npx vercel@latest rollback`

## Risk Flag

Current launch posture: **Medium risk, acceptable for a small Hobby launch after dashboard protections are checked.**

The main remaining launch risks are media weight, limited Hobby observability/log retention, and dashboard-only protections that cannot be confirmed from code.

## Deploy Verification - July 27, 2026

- Latest production deployment completed successfully after the local CLI timed out.
- Live `trststudios.online` now returns CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and COOP headers.
- Hashed Vite asset files now return `Cache-Control: public, max-age=31536000, immutable`.
- `/api/site-blueprints` still reports configured private Blob storage.

## Deployment Warnings To Review

- Vercel reported this project is in a microfrontends group, but no `microfrontends.json` exists. If you are not intentionally using Vercel Microfrontends, remove the project from that group in Vercel settings. If you are, add the expected config.
- Pure Bun setup is now explicit: `package-lock.json` removed, `bun.lock` retained, `packageManager` set to `bun@1.3.14`, and Vercel commands pinned to `bun install --frozen-lockfile --linker hoisted --backend=copyfile` plus `bun run build`.
