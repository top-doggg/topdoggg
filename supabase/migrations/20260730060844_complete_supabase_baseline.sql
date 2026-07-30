-- Reproducible baseline for the TRST Studios owned-customer backend.
-- Recorded in production migration history as version 20260730060844.
--
-- Printify remains the system of record for products, checkout, payments,
-- taxes, shipping, fulfillment, and commerce returns. Payment data must not be
-- stored in this schema.
--
-- This migration is intentionally safe to apply to the existing production
-- project, where these prototype community tables already exist. It also
-- creates the complete schema when replayed against a fresh Supabase project.

create schema if not exists private;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users (id) on delete restrict,
  title text,
  summary text,
  summary_updated_at timestamptz
);

create table if not exists public.thread_members (
  thread_id uuid not null references public.threads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists threads_created_by_idx
  on public.threads (created_by);

create index if not exists thread_members_user_id_idx
  on public.thread_members (user_id);

create index if not exists messages_thread_created_at_idx
  on public.messages (thread_id, created_at);

create index if not exists public_messages_sender_id_idx
  on public.messages (sender_id);

-- The composite message index already supports lookups by thread_id.
drop index if exists public.public_messages_thread_id_idx;

-- This empty two-column placeholder has no application references or defined
-- product responsibility, so it is deliberately excluded from the baseline.
drop table if exists public.trst;

alter table public.users enable row level security;
alter table public.threads enable row level security;
alter table public.thread_members enable row level security;
alter table public.messages enable row level security;

create or replace function private.is_thread_member(target_thread_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.thread_members as tm
    where tm.thread_id = target_thread_id
      and tm.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_thread_creator(target_thread_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.threads as t
    where t.id = target_thread_id
      and t.created_by = (select auth.uid())
  );
$$;

revoke all on schema private from public, anon, service_role;
revoke all on function private.is_thread_member(uuid)
  from public, anon, service_role;
revoke all on function private.is_thread_creator(uuid)
  from public, anon, service_role;

grant usage on schema private to authenticated;
grant execute on function private.is_thread_member(uuid) to authenticated;
grant execute on function private.is_thread_creator(uuid) to authenticated;

-- Data API exposure is explicit and least-privilege. RLS remains a separate
-- row-level authorization layer.
revoke all on table public.users
  from anon, authenticated, service_role;
revoke all on table public.threads
  from anon, authenticated, service_role;
revoke all on table public.thread_members
  from anon, authenticated, service_role;
revoke all on table public.messages
  from anon, authenticated, service_role;

grant select, insert on table public.users to authenticated;
grant update (display_name) on table public.users to authenticated;

grant select, insert on table public.threads to authenticated;
grant update (title, summary, summary_updated_at)
  on table public.threads to authenticated;

grant select, insert, delete
  on table public.thread_members to authenticated;

grant select, insert, delete
  on table public.messages to authenticated;

grant all on table public.users to service_role;
grant all on table public.threads to service_role;
grant all on table public.thread_members to service_role;
grant all on table public.messages to service_role;

drop policy if exists "Users own profile read" on public.users;
drop policy if exists "Users own profile write" on public.users;
drop policy if exists "Users own profile update" on public.users;

create policy "Users own profile read"
on public.users
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users own profile write"
on public.users
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users own profile update"
on public.users
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Thread create" on public.threads;
drop policy if exists "Thread read for members" on public.threads;
drop policy if exists "Thread update by members" on public.threads;

create policy "Thread create"
on public.threads
for insert
to authenticated
with check ((select auth.uid()) = created_by);

create policy "Thread read for members"
on public.threads
for select
to authenticated
using ((select private.is_thread_member(id)));

create policy "Thread update by members"
on public.threads
for update
to authenticated
using ((select private.is_thread_member(id)))
with check ((select private.is_thread_member(id)));

drop policy if exists "Membership read for members"
  on public.thread_members;
drop policy if exists "Membership insert" on public.thread_members;
drop policy if exists "Membership delete" on public.thread_members;

create policy "Membership read for members"
on public.thread_members
for select
to authenticated
using ((select private.is_thread_member(thread_id)));

create policy "Membership insert"
on public.thread_members
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.is_thread_creator(thread_id))
);

create policy "Membership delete"
on public.thread_members
for delete
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Message read for members" on public.messages;
drop policy if exists "Message insert for members" on public.messages;
drop policy if exists "Message delete for sender" on public.messages;

create policy "Message read for members"
on public.messages
for select
to authenticated
using ((select private.is_thread_member(thread_id)));

create policy "Message insert for members"
on public.messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and (select private.is_thread_member(thread_id))
);

create policy "Message delete for sender"
on public.messages
for delete
to authenticated
using (sender_id = (select auth.uid()));
