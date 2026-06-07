-- Migration: 20260601100400_create_message_table
-- Purpose: Create message table, message_sender enum, indexes, and RLS policies
-- Affected tables: message

-- ── Up ────────────────────────────────────────────────────────────────────────
create type message_sender as enum ('agent', 'customer');

create table message (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references ticket(id) on delete cascade,
  sender_type  message_sender not null,
  sender_id    uuid references "user"(id) on delete set null,  -- null for customer messages
  content      text not null,
  is_internal  boolean not null default false,
  created_at   timestamptz not null default now()
);

create index idx_message_ticket_id on message(ticket_id);

-- RLS
alter table message enable row level security;

-- Users can read messages on tickets they have access to (assigned or unassigned/open)
create policy "message_select"
  on message for select
  using (
    exists (
      select 1 from ticket t
      where t.id = ticket_id
      and (
        t.assigned_to = auth.uid()
        or t.assigned_to is null
        or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
      )
    )
  );

-- Agents can insert messages on assigned or open tickets; leads/admins on all
create policy "message_insert"
  on message for insert
  with check (
    exists (
      select 1 from ticket t
      where t.id = ticket_id
      and (
        t.assigned_to = auth.uid()
        or t.assigned_to is null
        or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
      )
    )
  );

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop policy if exists "message_insert" on message;
-- drop policy if exists "message_select" on message;
-- drop table if exists message;
-- drop type if exists message_sender;
