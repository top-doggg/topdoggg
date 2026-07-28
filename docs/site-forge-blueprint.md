# TRST Site Forge Blueprint

This turns the process used to build `trststudios.online` into a repeatable webapp workflow.

## Product Goal

Let a visitor provide a website idea through one or more sources:

- Instagram or Facebook handles/URLs
- Uploaded screenshots, product photos, mood images, or brand references
- A short written prompt describing the website they want

The app converts those inputs into a build-ready website blueprint: audience, tone, source summary, page plan, asset needs, safety checks, and deployment steps.

## Current MVP

- Frontend Site Forge intake inside the TRST website
- Deterministic blueprint preview generated in the browser
- Private Vercel Blob storage through `/api/site-blueprints`
- Bun/Vite build stays as the site runtime
- Human approval remains required before publishing any generated site

## Production Workflow

1. Intake: collect prompt, social references, and uploaded aesthetic files.
2. Source capture: store uploaded files privately and record social handles.
3. Style extraction: identify palette, subjects, captions, repeated symbols, product types, and voice.
4. Blueprint generation: turn the client material into page structure, copy direction, asset plan, and build checklist.
5. Build queue: create a Bun/Vite project from approved reusable components.
6. Review: generate preview, run build checks, inspect mobile/desktop, and revise.
7. Publish: deploy through Vercel only after approval and domain confirmation.

## OAuth And Social Media

Real Instagram/Facebook connection should be server-side only. The client can start the request, but access tokens must never be stored in browser storage. Meta app setup, permissions, and review are required before pulling account media directly.

## Safety Controls

- Private storage by default for user prompts, uploads, and blueprint JSON.
- Request body limits on intake endpoints.
- No automatic domain connection or public deployment without approval.
- Upload validation and image size limits before generated-site creation.
- Prompt and social captions treated as untrusted input.
- Clear separation between client intake, generation worker, and publish step.

## Next Build Layer

- Add signed upload URLs for inspiration images.
- Add Meta OAuth app credentials and callback routes.
- Add AI style extraction from uploaded images and social captions.
- Add a build worker that creates a draft site from the saved blueprint.
- Add an admin review screen for approving, editing, and deploying generated sites.
