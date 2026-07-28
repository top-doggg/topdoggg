# Site Forge Market Research And Product Direction

## What Current Builders Get Right

- Prompt-to-site speed lowers the starting friction.
- Editable output matters more than a locked generated page.
- Hosting, custom domains, forms, analytics, and SEO are bundled into the subscription.
- Pricing usually starts with a free or low entry plan, then charges for domains, bandwidth, CMS, collaborators, commerce, analytics, or AI credits.
- The strongest setups combine AI generation with a visual editor and a publishing pipeline.

## What They Usually Miss

- Small clients still need taste, not just templates.
- AI builders often stop at a generic site instead of a brand-specific story system.
- Social/photo inputs are still clunky, and OAuth setup is a bigger trust boundary than most landing pages admit.
- Monthly pricing can become confusing when domains, e-commerce, AI credits, storage, and add-ons split across plans.
- Human review is not positioned clearly enough, which creates a quality gap for real businesses.

## TRST Positioning

TRST Site Forge should be a guided creative build service, not a generic website vending machine.

Promise: upload the vibe, connect the story, approve the direction, and get a living website with monthly care.

Recommended public offer:

- Starter Care: $29/mo for simple hosted site care and light updates.
- Growth Care: $59/mo for lead capture, analytics review, managed updates, and refreshes.
- Studio Care: $99/mo for frequent campaigns, drops, product pages, and priority creative direction.

## Practical Architecture

- Frontend: Bun + Vite + React, fast client intake and preview.
- Storage: private Vercel Blob for blueprints, subscriber records, and uploaded source assets.
- Billing: Stripe subscriptions through Vercel once `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and plan price IDs are available.
- Auth: add Clerk or similar only when a client dashboard is ready; keep MVP as email-based intake to reduce signup friction.
- Social: server-side Meta OAuth only after app credentials and permissions are ready.
- Generation: AI creates structured blueprint first, then a reviewed Bun/Vite build, then deploy.
- Publishing: Vercel production deployment only after human approval.

## Optimized Build System

1. Intake collects plan, client name, email, prompt, social references, and visual files.
2. Blueprint endpoint stores clean structured data privately.
3. Admin review turns blueprint into approved build tasks.
4. Generator produces a site draft from reusable section patterns.
5. Human review checks mobile, copy, images, brand fit, speed, accessibility, and security.
6. Stripe subscription activates before long-term monthly care.
7. Client site is published and maintained under the selected care plan.

## Security Notes

- Never store social access tokens in localStorage.
- Keep uploaded assets private until approved for publication.
- Treat prompts, captions, filenames, and social data as untrusted.
- Rate-limit intake endpoints before paid traffic increases.
- Verify Stripe webhook signatures before changing account access or plan state.
