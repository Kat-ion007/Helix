-- Migration: 20260608191600_fix_ticket_update_policy
-- Purpose: Fix RLS update policy for ticket table
--
-- Problems fixed:
-- 1. Agents cannot update unassigned open tickets (the SELECT policy lets them
--    see these tickets, but the UPDATE policy blocks modifications).
-- 2. Without an explicit WITH CHECK, PostgreSQL reuses USING as WITH CHECK
--    and evaluates it against the *new* row. When status changes from 'open'
--    to 'resolved', the expression `assigned_to is null and status = 'open'`
--    fails on the new row → 42501 error. Adding WITH CHECK (true) separates
--    the "which rows can you touch?" gate (USING) from the "what can the
--    new row look like?" gate (WITH CHECK). DB constraints (enums, FKs)
--    still validate actual column values.

-- ── Up ────────────────────────────────────────────────────────────────────────
drop policy if exists "ticket_update_agent" on ticket;

create policy "ticket_update_agent"
  on ticket for update
  using (
    -- Gate: which rows can this user update?
    assigned_to = auth.uid()                                                     -- own tickets
    or (assigned_to is null and status = 'open')                                 -- unclaimed open tickets
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))  -- leads/admins: all
  )
  with check (true);  -- column-value validation is handled by DB constraints (enums, FKs)

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop policy if exists "ticket_update_agent" on ticket;
-- create policy "ticket_update_agent"
--   on ticket for update
--   using (
--     assigned_to = auth.uid()
--     or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
--   );
