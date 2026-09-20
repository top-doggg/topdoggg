# TRST Studios — Vercel Complete Setup Runbook

Last researched: 2026-09-20

## Purpose

This is the operational source of truth for completing the Vercel setup for TRST Studios without weakening preview security or introducing unnecessary runtime dependencies.

## Verified project identity

- Vercel team: `team_3ucEA2CqYmlQcdwNrEDXTSSn`
- Vercel project: `trststudios-replacement`
- Project ID: `prj_Xw4luLyt6S4aETmvQ1JhZHzlhIUH`
- GitHub repository: `top-doggg/topdoggg`
- Working source branch: `trststudios-storefront`
- Public production domains: `trststudios.online`, `www.trststudios.online`

## Current observed deployment state

- Current production deployment: `dpl_Bg18xj5YNJMpGuGmzVPf5CXhLME8`
- Current production commit: `c42b4264ceda03db3bbaef1c59fd4d7d68d85d6a`
- Phase 2 READY preview: `dpl_HSGcHUqBFQWRPNiMyLZA4TRC3s9N`
- Phase 2 commit: `615aa0a04bfbb77a2063f55547736b0506398dd4`
- Phase 2 preview is protected by Vercel Authentication / Deployment Protection.
- Direct automated fetches are redirected to Vercel SSO. This is expected behavior for protected preview deployments and is not an application routing failure.

## Root cause of the preview-verification issue

The Phase 2 preview is healthy and READY, but Vercel Deployment Protection intercepts unauthenticated requests before they reach the application. Temporary Shareable Links rely on a redirect that sets an authorization cookie. A stateless fetch client may not preserve that cookie across subsequent requests, so it can continue seeing the SSO redirect even when a share token was generated.

This is a verification-access problem, not evidence that the Journal, RSS, sitemap, or IndexNow routes failed to build.

## Target deployment-protection configuration

Keep Standard Protection enabled for previews. Do not make previews public just to make automated testing easier.

Preferred access hierarchy:

1. **Trusted Sources / OIDC** for supported automated services. Vercel introduced this in 2026 and recommends short-lived OIDC identity over long-lived shared secrets when the caller supports it.
2. **Protection Bypass for Automation** for tools that cannot provide a compatible OIDC token.
3. **Shareable Links** for temporary human browser review.
4. Do not disable Deployment Protection globally.

For Protection Bypass for Automation:
- create a dedicated secret named for the automation purpose, e.g. `TRST preview verification`;
- allow Vercel to expose the selected secret as the system variable `VERCEL_AUTOMATION_BYPASS_SECRET`;
- automated requests should send `x-vercel-protection-bypass`;
- for browser-style follow-up requests, also send `x-vercel-set-bypass-cookie: true`;
- never commit the secret to Git.

A bypass secret change requires a redeploy before the updated system environment variable is available in the deployment.

## Preferred preview test path

When Vercel CLI is available, use `vercel curl` against the exact preview deployment. Current Vercel CLI automatically handles Deployment Protection for authenticated users.

Validation set for Phase 2:

- `/`
- `/journal`
- `/journal/coming-back-home`
- `/journal/old-town-boogie`
- `/journal/the-realest-feeling`
- `/rss.xml`
- `/sitemap.xml`
- `/9db50a3983c44815e0a030a0c2def0da.txt`
- `/api/indexnow-sync`

For HTML routes verify:
- HTTP 200
- correct canonical
- route-specific title and description
- expected JSON-LD
- no accidental `noindex`

For XML/text assets verify:
- HTTP 200
- correct content
- sitemap contains Journal and work URLs
- RSS contains canonical Journal URLs
- IndexNow key file contains only the configured key

## Cron and IndexNow configuration

Vercel Cron runs only on Production deployments. The Phase 2 cron will not execute while Phase 2 remains a Preview deployment.

Required secret:
- `CRON_SECRET`
- Production environment required
- random URL-safe value, at least 16 characters; 32+ bytes of entropy is preferred operationally
- never commit it to source

Vercel sends cron requests with:
`Authorization: Bearer <CRON_SECRET>`

The endpoint must compare the incoming Authorization header with `process.env.CRON_SECRET`.

After production deployment:
1. confirm the cron definition appears in Vercel Settings → Cron Jobs;
2. invoke it once manually using Vercel's cron tooling or an authenticated request;
3. verify successful IndexNow response;
4. verify the private Blob state record was written;
5. run again and verify unchanged sitemap state results in no duplicate submission.

## Production promotion model

The production custom domains should remain public while generated preview/deployment URLs remain protected.

Supported promotion paths:
- Vercel Dashboard: deployment menu → Promote to Production.
- Vercel CLI: `vercel promote <deployment-id-or-url>`.
- Vercel REST/SDK: project `requestPromote` using the project ID and deployment ID.

Do not use `vercel alias` as the normal production-promotion mechanism.

Important: promoting a Preview deployment to Production causes a production deployment/rebuild and uses Production environment variables. Therefore `CRON_SECRET` must exist in Production before the Phase 2 promotion if IndexNow automation is expected to become active immediately.

## Git branch strategy

The repository default branch `main` and `trststudios-storefront` are separate histories and must not be merged as a deployment workaround.

Keep `trststudios-storefront` as the authoritative site source unless the owner explicitly changes the architecture.

Before changing Vercel Production Branch tracking, verify whether the desired workflow is:
- controlled manual promotion from `trststudios-storefront` previews; or
- automatic production deployment on every push to a dedicated production branch.

For TRST's current high-control workflow, manual promotion after preview validation is safer. Do not switch to automatic production-on-push merely to solve the preview protection issue.

## Production environment checklist

Required/expected:
- Blob credentials/storage binding already used by `/api/film`, `/api/profile-image`, subscriber storage, and IndexNow state.
- `CRON_SECRET`: required for Phase 2 scheduled IndexNow.
- `VERCEL_AUTOMATION_BYPASS_SECRET`: system variable when Protection Bypass for Automation is configured; intended for testing protected deployments, not application business logic.
- optional Resend variables remain separate from SEO/IndexNow configuration.

Do not expose secret values in client bundles or source control.

## Final promotion gate

Do not promote Phase 2 until all of these are true:

- deployment state READY;
- protected preview can be tested through Vercel-authenticated curl or an automation bypass;
- Journal detail pages return 200 and route-specific HTML metadata;
- `rss.xml` and `sitemap.xml` validate;
- IndexNow key file returns 200;
- production `CRON_SECRET` exists;
- no preview runtime errors;
- production rollback candidate is identified;
- current custom-domain production deployment is recorded.

After promotion:
- verify both apex and `www`;
- verify media APIs and byte-range video behavior;
- verify Journal, sitemap, RSS, robots, profile and film;
- verify cron registration and one IndexNow execution;
- inspect production runtime errors;
- keep the previous production deployment available for rollback.

## Tooling limitation observed in ChatGPT

The connected Vercel MCP can inspect deployments, logs, projects, generate share links, and fetch Vercel URLs. In the current connector surface it does not expose environment-variable mutation, Deployment Protection mutation, or a direct production-promotion action. Vercel's platform itself supports these operations through Dashboard, CLI and REST/SDK. This distinction matters: the platform supports the configuration; the currently exposed MCP action set is narrower.
