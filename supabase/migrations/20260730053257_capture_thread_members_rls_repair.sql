-- Capture the production repair for the recursive thread_members SELECT policy.
--
-- The original policy queried public.thread_members from a policy on the same
-- table, causing Postgres to abort authenticated reads with:
--   infinite recursion detected in policy for relation "thread_members"
--
-- Keep the helper outside the exposed public schema. It checks the calling
-- user's identity internally and bypasses RLS only for this membership lookup.

create schema if not exists private;

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

revoke all on function private.is_thread_member(uuid)
from public, anon, service_role;

grant usage on schema private to authenticated;
grant execute on function private.is_thread_member(uuid) to authenticated;

drop policy if exists "Membership read for members"
on public.thread_members;

create policy "Membership read for members"
on public.thread_members
for select
to authenticated
using ((select private.is_thread_member(thread_id)));
