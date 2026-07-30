# TRST Studios Data Architecture

This document defines the ownership boundary between Printify, Vercel, and
Supabase for the TRST Studios storefront.

## System responsibilities

### Printify

Printify remains the system of record for:

- Product configuration and variants
- Cart handoff and checkout
- Payment processing
- Taxes, shipping, and fulfillment
- Printify order and return workflows

The TRST Studios application must not collect or mirror card numbers, payment
credentials, or other sensitive payment data in Supabase.

### Vercel

Vercel hosts the React storefront and its serverless endpoints. The current
subscriber and Site Forge intake endpoints store private records in Vercel Blob.
That behavior remains unchanged until a separate, reviewed data migration is
approved.

### Supabase

Supabase is reserved for owned customer experiences that need relational data,
authentication, authorization, or realtime behavior:

- Customer accounts and profiles
- Community discussions and messages
- Editorial content managed by the studio
- Saved products, wishlists, or release access
- Other customer-facing features whose data belongs to TRST Studios

Supabase is not currently part of the public storefront request path.

## Existing community schema review

The connected project currently contains these empty, RLS-enabled tables:

| Table | Intended role | Review status |
| --- | --- | --- |
| `users` | Public profile paired with `auth.users` | Plausible foundation; not connected to the storefront |
| `threads` | Community conversation container | Prototype only; product requirements are not defined |
| `thread_members` | Conversation membership | Recursive SELECT policy repaired and captured in migrations |
| `messages` | Messages inside a thread | Prototype only; depends on the membership model |

These tables must not be connected to the storefront until account, moderation,
retention, abuse-reporting, and member-removal requirements are defined. Their
current zero-row state makes this the right time to revise or replace the model
without a data migration.

## Row-level security repair

The former `thread_members` SELECT policy queried `thread_members` from inside
its own policy expression. That caused recursive RLS evaluation.

`supabase/migrations/20260730053257_capture_thread_members_rls_repair.sql`
preserves the intended behavior: members may see the participants in threads
they belong to through a narrowly scoped helper in the non-exposed `private`
schema.

The helper:

- Checks `(select auth.uid())` internally
- Has a fixed empty `search_path`
- Is callable by `authenticated` only
- Is not callable by `anon` or `service_role`

## Migration rules

Every new table migration must treat database privileges, RLS, and policies as
one reviewed unit.

Use explicit, least-privilege grants. Do not copy a broad grant block without
matching it to the feature's access model.

```sql
-- Example: authenticated users own private rows.
create table public.example_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

revoke all on table public.example_items from anon;
grant select, insert, update, delete
on table public.example_items
to authenticated;
grant all on table public.example_items to service_role;

alter table public.example_items enable row level security;

create policy "Owners can read example items"
on public.example_items
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Owners can insert example items"
on public.example_items
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Owners can update example items"
on public.example_items
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Owners can delete example items"
on public.example_items
for delete
to authenticated
using ((select auth.uid()) = user_id);
```

Grant sequence privileges explicitly when a table uses identity or serial
columns and API roles need to insert rows.

## Before building community features

Define and approve:

1. Account and display-name rules
2. Public versus private thread visibility
3. Who may invite, remove, block, and report members
4. Message editing and deletion behavior
5. Retention and account-deletion behavior
6. Moderation and audit requirements
7. Rate limits and anti-abuse controls

Only then should the storefront initialize a browser Supabase client with its
public project URL and publishable key. Secret and service-role keys must remain
server-side.
