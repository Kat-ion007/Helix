-- Migration: 20260601100300_create_ticket_table
-- Purpose: Create ticket table, status/priority enums, indexes, and RLS policies
-- Affected tables: ticket

-- ── Up ────────────────────────────────────────────────────────────────────────
create type ticket_status   as enum ('open', 'pending', 'resolved', 'escalated');
create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');

create table ticket (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  status       ticket_status   not null default 'open',
  priority     ticket_priority not null default 'medium',
  customer_id  uuid not null references customer(id) on delete cascade,
  assigned_to  uuid references "user"(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  sla_due      timestamptz
);

-- Indexes for query performance
create index idx_ticket_status       on ticket(status);
create index idx_ticket_assigned_to  on ticket(assigned_to);
create index idx_ticket_priority     on ticket(priority);
create index idx_ticket_customer_id  on ticket(customer_id);
create index idx_ticket_sla_due      on ticket(sla_due);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ticket_updated_at_trigger
before update on ticket
for each row execute function update_updated_at();

-- RLS
alter table ticket enable row level security;

-- Agents see their assigned tickets and all open (unassigned) tickets; leads/admins see all
create policy "ticket_select_agent"
  on ticket for select
  using (
    assigned_to = auth.uid()
    or status = 'open'
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

-- Agents can update only their assigned tickets; leads/admins can update all
create policy "ticket_update_agent"
  on ticket for update
  using (
    assigned_to = auth.uid()
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

-- Only leads and admins can create tickets
create policy "ticket_insert_lead_admin"
  on ticket for insert
  with check (
    exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

-- Only admins can delete tickets
create policy "ticket_delete_admin"
  on ticket for delete
  using (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  );

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop policy if exists "ticket_delete_admin" on ticket;
-- drop policy if exists "ticket_insert_lead_admin" on ticket;
-- drop policy if exists "ticket_update_agent" on ticket;
-- drop policy if exists "ticket_select_agent" on ticket;
-- drop trigger if exists ticket_updated_at_trigger on ticket;
-- drop function if exists update_updated_at;
-- drop table if exists ticket;
-- drop type if exists ticket_priority;
-- drop type if exists ticket_status;
