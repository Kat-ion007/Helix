-- Migration: 20260617021000_allow_agents_to_select_all_users
-- Purpose: Allow agents to select other agents from the user table to enable ticket assignment and escalation.
-- Affected tables: user

-- ── Up ────────────────────────────────────────────────────────────────────────
drop policy if exists "user_select" on "user";

create policy "user_select"
  on "user" for select
  using (
    auth.uid() is not null
  );

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop policy if exists "user_select" on "user";
-- create policy "user_select"
--   on "user" for select
--   using (
--     auth.uid() = id
--     or role::text in ('lead', 'admin')
--     or public.get_my_role() in ('lead', 'admin')
--     or auth.uid() is not null
--   );
