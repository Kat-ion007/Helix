-- Migration: 20260601100600_create_ticket_activity
-- Purpose: Create ticket_activity audit log table, trigger function, and RLS policies
-- Affected tables: ticket_activity, ticket

-- ── Up ────────────────────────────────────────────────────────────────────────
create table ticket_activity (
  id              uuid primary key default gen_random_uuid(),
  ticket_id       uuid not null references ticket(id) on delete cascade,
  actor_id        uuid references "user"(id) on delete set null,
  action          text not null,
  previous_value  jsonb,
  new_value       jsonb,
  created_at      timestamptz not null default now()
);

-- RLS
alter table ticket_activity enable row level security;

-- Users can read activity logs on tickets they can access (assigned, open, or leads/admins)
create policy "ticket_activity_select"
  on ticket_activity for select
  using (
    exists (
      select 1 from ticket t
      where t.id = ticket_id
      and (
        t.assigned_to = auth.uid()
        or t.status = 'open'
        or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
      )
    )
  );

-- Trigger: auto-log ticket status and assignment changes
-- The function uses security definer with an explicit search_path to prevent injection
create or replace function log_ticket_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into ticket_activity (ticket_id, actor_id, action, previous_value, new_value)
    values (
      new.id,
      auth.uid(),
      'status_change',
      jsonb_build_object('status', old.status),
      jsonb_build_object('status', new.status)
    );
  end if;

  if old.assigned_to is distinct from new.assigned_to then
    insert into ticket_activity (ticket_id, actor_id, action, previous_value, new_value)
    values (
      new.id,
      auth.uid(),
      'assignment_change',
      jsonb_build_object('assigned_to', old.assigned_to),
      jsonb_build_object('assigned_to', new.assigned_to)
    );
  end if;

  return new;
end;
$$;

create trigger ticket_audit_trigger
after update on ticket
for each row execute function log_ticket_status_change();

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop trigger if exists ticket_audit_trigger on ticket;
-- drop function if exists log_ticket_status_change;
-- drop policy if exists "ticket_activity_select" on ticket_activity;
-- drop table if exists ticket_activity;
