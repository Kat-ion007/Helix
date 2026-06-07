-- Migration: 20260601100800_enable_realtime
-- Purpose: Enable realtime on ticket, message, and escalation tables
-- Affected tables: ticket, message, escalation

-- ── Up ────────────────────────────────────────────────────────────────────────
-- Ensure publication exists first (standard in Supabase projects)
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end;
$$;

-- Register tables for Realtime broadcast
alter publication supabase_realtime add table ticket;
alter publication supabase_realtime add table message;
alter publication supabase_realtime add table escalation;

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- alter publication supabase_realtime drop table if exists ticket;
-- alter publication supabase_realtime drop table if exists message;
-- alter publication supabase_realtime drop table if exists escalation;
