-- Migration: 20260601100500_create_escalation_table
-- Purpose: Create escalation table, escalation_status enum, indexes, and RLS policies
-- Affected tables: escalation

-- ── Up ────────────────────────────────────────────────────────────────────────
create type escalation_status as enum ('open', 'closed');

create table escalation (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references ticket(id) on delete cascade,
  from_user   uuid not null references "user"(id) on delete cascade,
  to_user     uuid not null references "user"(id) on delete cascade,
  reason      text,
  status      escalation_status not null default 'open',
  created_at  timestamptz not null default now()
);

create index idx_escalation_ticket_id on escalation(ticket_id);

-- RLS
alter table escalation enable row level security;

-- Users see escalations they are the sender or receiver of; leads/admins see all
create policy "escalation_select"
  on escalation for select
  using (
    from_user = auth.uid()
    or to_user = auth.uid()
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

-- Any agent with a profile can create an escalation
create policy "escalation_insert"
  on escalation for insert
  with check (
    exists (select 1 from "user" where id = auth.uid())
  );

-- Only leads and admins can close (update) escalations
create policy "escalation_update_lead_admin"
  on escalation for update
  using (
    exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop policy if exists "escalation_update_lead_admin" on escalation;
-- drop policy if exists "escalation_insert" on escalation;
-- drop policy if exists "escalation_select" on escalation;
-- drop table if exists escalation;
-- drop type if exists escalation_status;
