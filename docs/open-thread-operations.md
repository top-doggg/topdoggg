# TRST Open Thread Operations

## Live intake path

`city post or QR link -> chapter page -> private signal record -> consented email receipt -> internal alert -> human review`

The site records chapter, UTM source, referrer, consent choices, and a review status of `new`. No submitted signal is public by default. Publication is a human decision and requires the visitor's explicit permission.

## Required production setting

Set `TRST_OPERATIONS_EMAIL` in Vercel for Production, Preview, and Development. This is the private inbox that receives a new-signal or new-partner-inquiry alert. It must be an address controlled by TRST.

## Weekly operating rhythm

| When | Owner action | Output |
| --- | --- | --- |
| Daily | Review new signal alerts; select only consented entries for possible use. | A clean human-approved queue. |
| Tuesday | Publish one city question, artist process moment, or consented community excerpt. | New local discovery. |
| Thursday | Reach out to three local anchors with a specific, low-lift collaboration ask. | Warm partner pipeline. |
| Friday | Check sources, signal count, opt-ins, product views, and checkout starts by chapter. | One decision for the next week. |
| Monthly | Send one considered chapter update to people who opted in. | Retention without spam. |

## Automation rules

- A chapter update opt-in stores a Resend contact with `trst_source`, `trst_chapter`, `trst_last_signal_at`, and `trst_publish_permission` properties.
- An opted-in contributor receives one chapter-specific receipt. The receipt has a one-click unsubscribe route.
- New signals and partner inquiries send an internal email only to `TRST_OPERATIONS_EMAIL`.
- The external emails are idempotent, so retries cannot create duplicate receipts or alerts.
- Do not automate Instagram DMs or publish community submissions. Those need human judgment and are handled from the review queue.

## First scorecard

Track each chapter separately:

1. Unique chapter sessions by UTM source.
2. Signals submitted.
3. Opt-ins and publication permission rate.
4. Partner inquiries and qualified conversations.
5. Product-detail views, checkout clicks, and orders associated with a chapter campaign.

## Next operating upgrades

1. A protected staff review dashboard, with `new`, `approved`, `needs follow-up`, `declined`, and `published` states.
2. A small partner CRM with a next action and follow-up date for every relationship.
3. A daily digest only after there is enough volume to justify it. On Vercel Hobby, scheduled work is once daily and not exact, so real-time alerts remain the primary workflow.
