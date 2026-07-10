# PlusOne Event Companion App

This workspace contains a v1 product prototype for a one-metro plus-one marketplace. It implements the planned service as a usable booking and operations experience with a small local API layer:

- event brief intake with 24-hour and 48-hour planning tiers
- escrow-style booking estimate
- vetted companion cards
- safety policy system and SOS demo flow
- companion operations model
- grounded integration readiness cards
- pilot validation metrics
- edge-case scenario simulator

Run `node server.js` and open `http://localhost:5173` for the API-backed version. The app loads pilot data from `data.json` through `/api/bootstrap` and queues manual-review booking requests through `/api/bookings`.

You can also open `index.html` directly for a static preview. In that mode, the app falls back if the local API is unavailable.

## Launch Notes

The prototype assumes a U.S.-based, adult-only, public-venue-first pilot with vetted independent contractors and manual booking approval. Legal review is still required before any real launch, especially for worker classification, background checks, local regulations, insurance, cancellation policy, and platform liability.
