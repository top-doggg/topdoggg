# TRST Studios Storefront

Official React and Vite storefront for TRST Studios.

The project combines an editorial portfolio, apparel collection, Printify checkout links, Site Forge lead capture, and responsive interactive presentation.

## Technology

* React
* Vite
* Bun
* Vercel
* Vercel Functions
* Vercel Blob
* Vercel Analytics

## Local Development

```powershell
cd "D:\common_attachment\trststudios.online"
bun install
bun run dev
```

Open:

```text
http://localhost:5173
```

## Production Build

```powershell
bun run build
```

The production build is written to:

```text
dist/
```

Preview the production build locally:

```powershell
bun run preview
```

## Printify Checkout

The storefront sends customers to the TRST Studios Printify storefront for product configuration, payment, and fulfillment.

Create `.env.local` and configure:

```text
VITE_PRINTIFY_STORE_URL=https://your-store.printify.me
VITE_PRINTIFY_SIN_MIEDO_URL=https://your-store.printify.me/product/your-product
```

Use public storefront and product URLs. Do not place Printify API tokens in frontend environment variables.

Printify remains the commerce system of record. The application must not copy
card numbers, payment credentials, or other sensitive payment data into
Supabase.

## Data Architecture

Supabase is reserved for owned experiences such as accounts, community,
editorial content, and saved customer preferences. It is not currently part of
the public storefront request path.

See [`docs/data-architecture.md`](docs/data-architecture.md) for the reviewed
system boundaries, the existing community-schema assessment, RLS requirements,
and the explicit Data API grant convention for future migrations.

## Serverless API

The Vercel Functions are located in `api/`.

Current endpoints include:

```text
POST /api/subscribe
GET  /api/subscribe

POST /api/site-blueprints
GET  /api/site-blueprints
```

The functions use Vercel Blob for private submission storage.

Optional frontend endpoint overrides:

```text
VITE_SUBSCRIBE_ENDPOINT=/api/subscribe
VITE_FORGE_ENDPOINT=/api/site-blueprints
```

## Deployment

Repository:

```text
top-doggg/topdoggg
```

Storefront branch:

```text
trststudios-storefront
```

The Vercel project should be configured to deploy this branch.

Production domains:

```text
trststudios.online
www.trststudios.online
```

## Repository Organization

```text
api/        Vercel serverless functions
docs/       Product, marketing, and deployment documentation
public/     Static public assets
scripts/    Printify and artwork-production utilities
src/        React application source
```

Large print-production files, local design references, audit output, and unrelated projects are intentionally excluded through `.gitignore`.
