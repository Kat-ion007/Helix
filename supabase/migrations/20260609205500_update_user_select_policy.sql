-- Migration: 20260609205500_update_user_select_policy
-- Purpose: Update RLS select policy on user table to allow agents to select leads and admins for ticket escalation.
-- Affected tables: user

-- ── Up ────────────────────────────────────────────────────────────────────────
-- Create or replace the helper function with explicit schema and path to ensure it exists
create or replace function public.get_my_role()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  select role::text into v_role from "user" where id = auth.uid();
  return v_role;
end;
$$;

drop policy if exists "user_select" on "user";

create policy "user_select"
  on "user" for select
  using (
    auth.uid() = id
    or role::text in ('lead', 'admin')
    or public.get_my_role() in ('lead', 'admin')
  );

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop policy if exists "user_select" on "user";
-- create policy "user_select"
--   on "user" for select
--   using (
--     auth.uid() = id
--     or public.get_my_role() in ('lead', 'admin')
--   );
