-- Helix Combined Schema Migrations and Seed Data
-- Copy this entire script and run it in the Supabase SQL Editor (https://supabase.com/dashboard/project/fdcwabaubrkxaqbupjwr/sql/new)

-- ── 0. Enable Required Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── 1. Create Enums and Types ──────────────────────────────────────────────────
create type user_role as enum ('agent', 'lead', 'admin');
create type ticket_status   as enum ('open', 'pending', 'resolved', 'escalated');
create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type message_sender as enum ('agent', 'customer');
create type escalation_status as enum ('open', 'closed');

-- ── 2. Create Tables ───────────────────────────────────────────────────────────
-- User profile table (linked to auth.users)
create table "user" (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  role        user_role not null default 'agent',
  created_at  timestamptz not null default now()
);

-- Customer table
create table customer (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);

-- Ticket table
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

-- Message table
create table message (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references ticket(id) on delete cascade,
  sender_type  message_sender not null,
  sender_id    uuid references "user"(id) on delete set null,  -- null for customer messages
  content      text not null,
  is_internal  boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Escalation table
create table escalation (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references ticket(id) on delete cascade,
  from_user   uuid not null references "user"(id) on delete cascade,
  to_user     uuid not null references "user"(id) on delete cascade,
  reason      text,
  status      escalation_status not null default 'open',
  created_at  timestamptz not null default now()
);

-- Ticket Activity Log table
create table ticket_activity (
  id              uuid primary key default gen_random_uuid(),
  ticket_id       uuid not null references ticket(id) on delete cascade,
  actor_id        uuid references "user"(id) on delete set null,
  action          text not null,
  previous_value  jsonb,
  new_value       jsonb,
  created_at      timestamptz not null default now()
);

-- Macro responses table
create table macro (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- ── 3. Create Indexes for Performance ──────────────────────────────────────────
create index idx_ticket_status       on ticket(status);
create index idx_ticket_assigned_to  on ticket(assigned_to);
create index idx_ticket_priority     on ticket(priority);
create index idx_ticket_customer_id  on ticket(customer_id);
create index idx_ticket_sla_due      on ticket(sla_due);

create index idx_message_ticket_id   on message(ticket_id);
create index idx_escalation_ticket_id on escalation(ticket_id);

-- ── 4. Set Up Row Level Security (RLS) ────────────────────────────────────────
-- user table RLS
-- RLS Helper function to avoid policy recursion
create or replace function get_my_role()
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

alter table "user" enable row level security;

create policy "user_select"
  on "user" for select
  using (
    auth.uid() = id
    or get_my_role() in ('lead', 'admin')
  );

create policy "user_all_admin"
  on "user" for all
  using (
    get_my_role() = 'admin'
  )
  with check (
    get_my_role() = 'admin'
  );

-- customer table RLS
alter table customer enable row level security;

create policy "customer_select"
  on customer for select
  using (
    exists (select 1 from "user" where id = auth.uid())
  );

create policy "customer_write_admin"
  on customer for all
  using (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  );

-- ticket table RLS
alter table ticket enable row level security;

create policy "ticket_select_agent"
  on ticket for select
  using (
    assigned_to = auth.uid()
    or status = 'open'
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

create policy "ticket_update_agent"
  on ticket for update
  using (
    assigned_to = auth.uid()
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

create policy "ticket_insert_lead_admin"
  on ticket for insert
  with check (
    exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

create policy "ticket_delete_admin"
  on ticket for delete
  using (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  );

-- message table RLS
alter table message enable row level security;

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

-- escalation table RLS
alter table escalation enable row level security;

create policy "escalation_select"
  on escalation for select
  using (
    from_user = auth.uid()
    or to_user = auth.uid()
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

create policy "escalation_insert"
  on escalation for insert
  with check (
    exists (select 1 from "user" where id = auth.uid())
  );

create policy "escalation_update_lead_admin"
  on escalation for update
  using (
    exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

-- ticket_activity table RLS
alter table ticket_activity enable row level security;

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

-- macro table RLS
alter table macro enable row level security;

create policy "macro_select"
  on macro for select
  using (
    exists (select 1 from "user" where id = auth.uid())
  );

create policy "macro_write_admin"
  on macro for all
  using (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  );

-- ── 5. Triggers and Custom Database Functions ────────────────────────────────
-- Auto-update updated_at on ticket updates
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

-- Auto-log ticket status and assignment changes to ticket_activity
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

-- Atomic escalate_ticket function (RPC)
create or replace function escalate_ticket(
  p_ticket_id uuid,
  p_from_user uuid,
  p_to_user uuid,
  p_reason text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_escalation_id uuid;
begin
  -- Insert escalation record
  insert into escalation (ticket_id, from_user, to_user, reason, status)
  values (p_ticket_id, p_from_user, p_to_user, p_reason, 'open')
  returning id into v_escalation_id;

  -- Update ticket assignment and status
  update ticket
  set assigned_to = p_to_user, status = 'escalated', updated_at = now()
  where id = p_ticket_id;

  return v_escalation_id;
end;
$$;

-- ── 6. Create Views for Dashboard Metrics ───────────────────────────────────
-- View for ticket counts grouped by status
create or replace view v_ticket_status_counts as
select status, count(*) as count
from ticket
where exists (
  select 1 from "user" 
  where id = auth.uid() 
  and role in ('lead', 'admin')
)
group by status;

-- View for active SLA breaches (not resolved, past due date)
create or replace view v_sla_breach_count as
select count(*) as count
from ticket
where sla_due < now() 
and status != 'resolved'
and exists (
  select 1 from "user" 
  where id = auth.uid() 
  and role in ('lead', 'admin')
);

-- View for agent workload distribution (unresolved tickets per user)
create or replace view v_agent_workload as
select 
  u.id as agent_id, 
  u.name as agent_name, 
  u.role as agent_role, 
  count(t.id) as ticket_count
from "user" u
left join ticket t on t.assigned_to = u.id and t.status != 'resolved'
where exists (
  select 1 from "user" 
  where id = auth.uid() 
  and role in ('lead', 'admin')
)
group by u.id, u.name, u.role;

-- View for 7-day resolution trend (daily count of tickets set to resolved)
create or replace view v_resolution_trend as
select
  d.resolved_date::date as resolved_date,
  count(a.id) as resolved_count
from (
  select generate_series(
    current_date - interval '6 days',
    current_date,
    interval '1 day'
  )::date as resolved_date
) d
left join ticket_activity a on 
  a.created_at::date = d.resolved_date
  and a.action = 'status_change'
  and a.new_value->>'status' = 'resolved'
where exists (
  select 1 from "user" 
  where id = auth.uid() 
  and role in ('lead', 'admin')
)
group by d.resolved_date
order by d.resolved_date;

-- ── 7. Enable Realtime Publications ──────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end;
$$;

alter publication supabase_realtime add table ticket;
alter publication supabase_realtime add table message;
alter publication supabase_realtime add table escalation;

-- ── 8. Seed Default Macros ───────────────────────────────────────────────────
insert into macro (name, content) values
  ('Request more info', 'Could you please provide additional details about this issue?'),
  ('Acknowledged', 'Thanks for reaching out. Our team is looking into this.'),
  ('Resolved', 'This issue has been resolved. Please reopen if the issue persists.')
on conflict (name) do nothing;

-- ── 9. Seed Auth Users ────────────────────────────────────────────────────────
-- Hashed password is 'password123' for all accounts
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
values
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'agent@helix.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated'),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'lead@helix.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated'),
  ('adadadad-adad-adad-adad-adadadadadad', 'admin@helix.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated')
on conflict (id) do nothing;

-- ── 10. Seed Public Profiles ──────────────────────────────────────────────────
insert into public."user" (id, name, email, role)
values
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Sarah Agent', 'agent@helix.com', 'agent'),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Marcus Lead', 'lead@helix.com', 'lead'),
  ('adadadad-adad-adad-adad-adadadadadad', 'Alice Admin', 'admin@helix.com', 'admin')
on conflict (id) do nothing;

-- ── 11. Seed Customers ────────────────────────────────────────────────────────
insert into public.customer (id, name, email, metadata)
values
  ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Acme Corp (John Doe)', 'john@acme.com', '{"tier": "enterprise", "country": "US"}'),
  ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Globex Corp (Jane Smith)', 'jane@globex.com', '{"tier": "pro", "country": "CA"}'),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'Initech (Peter Gibbons)', 'peter@initech.com', '{"tier": "free", "country": "US"}'),
  ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'Umbrella Corp (Albert)', 'albert@umbrella.com', '{"tier": "enterprise", "country": "DE"}'),
  ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'Hooli (Gavin Belson)', 'gavin@hooli.com', '{"tier": "pro", "country": "US"}')
on conflict (id) do nothing;

-- ── 12. Seed Tickets ──────────────────────────────────────────────────────────
insert into public.ticket (id, title, description, status, priority, customer_id, assigned_to, created_at, updated_at, sla_due)
values
  -- Unassigned Open Tickets
  ('f1010101-1101-1101-1101-110101010101', 'Unable to login to portal', 'Getting 500 error when clicking sign-in.', 'open', 'urgent', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', null, now() - interval '1 hour', now() - interval '1 hour', now() + interval '15 minutes'),
  ('f1020202-1102-1102-1102-110202020202', 'API webhook failures', 'Webhooks failing with timeout to our endpoints.', 'open', 'high', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', null, now() - interval '2 hours', now() - interval '2 hours', now() + interval '2 hours'),
  ('f1030303-1103-1103-1103-110303030303', 'Request to export customer data', 'Need full CSV dump of user records for audit.', 'open', 'medium', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', null, now() - interval '3 hours', now() - interval '3 hours', now() + interval '8 hours'),
  ('f1040404-1104-1104-1104-110404040404', 'Broken link in docs footer', 'Typo in link to API reference.', 'open', 'low', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', null, now() - interval '5 hours', now() - interval '5 hours', now() + interval '48 hours'),
  
  -- Assigned Pending Tickets (Sarah Agent)
  ('f2010101-2201-2201-2201-220101010101', 'Billing billing discrepancy', 'Charged twice for subscription this month.', 'pending', 'high', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '4 hours', now() - interval '1 hour', now() + interval '1 hour'),
  ('f2020202-2202-2202-2202-220202020202', 'Custom domain verification failed', 'CNAME is set up but dashboard still says pending.', 'pending', 'medium', 'c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '1 day', now() - interval '2 hours', now() + interval '4 hours'),
  ('f2030303-2203-2203-2203-220303030303', 'SMTP integration failure', 'SMTP test email is not sending, error code 535.', 'pending', 'high', 'c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '2 hours', now() - interval '30 minutes', now() - interval '10 minutes'), -- SLA Breached!
  
  -- Escalated Tickets
  ('f3010101-3301-3301-3301-330101010101', 'Database migration timeout', 'Customer DB upgrade timed out at 99%.', 'escalated', 'urgent', 'c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', now() - interval '3 hours', now() - interval '10 minutes', now() - interval '2 hours'), -- SLA Breached!
  ('f3020202-3302-3302-3302-330202020202', 'Enterprise SLA inquiry', 'Clarification on availability guarantees.', 'escalated', 'medium', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', now() - interval '2 days', now() - interval '1 day', now() + interval '12 hours'),

  -- Resolved Tickets
  ('f4010101-4401-4401-4401-440101010101', 'Reset password link not received', 'Requested reset but got no email.', 'resolved', 'medium', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '2 days', now() - interval '1 day', now() - interval '1 day'),
  ('f4020202-4402-4402-4402-440202020202', 'Upgrade plan inquiry', 'How to add 5 more seats to our plan.', 'resolved', 'low', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '3 days', now() - interval '2 days', now() - interval '2 days')
on conflict (id) do nothing;

-- ── 13. Seed Message Threads ──────────────────────────────────────────────────
insert into public.message (id, ticket_id, sender_type, sender_id, content, is_internal, created_at)
values
  -- Thread for t101 (Login issue)
  ('e1010101-1101-1101-1101-110101010101', 'f1010101-1101-1101-1101-110101010101', 'customer', null, 'Hi, I cannot sign into the client portal. It keeps throwing a white screen and a 500 error. Please help.', false, now() - interval '1 hour'),

  -- Thread for t201 (Billing discrepancy)
  ('e2010101-2201-2201-2201-220101010101', 'f2010101-2201-2201-2201-220101010101', 'customer', null, 'Hello, I was charged twice for the Enterprise subscription this month. Invoice numbers are INV-4050 and INV-4051. I need one refunded.', false, now() - interval '4 hours'),
  ('e2010202-2201-2201-2201-220102020202', 'f2010101-2201-2201-2201-220101010101', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Hi John, I am reviewing our stripe logs now to see why the double charge happened. I will get back to you in a few minutes.', false, now() - interval '3 hours'),
  ('e2010303-2201-2201-2201-220103030303', 'f2010101-2201-2201-2201-220101010101', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Note to self: Stripe dashboard does show two pending charges. Looks like a webhook retry duplicate. Need to verify database did not create two accounts.', true, now() - interval '2 hours'),
  ('e2010404-2201-2201-2201-220104040404', 'f2010101-2201-2201-2201-220101010101', 'customer', null, 'Thank you Sarah, standing by.', false, now() - interval '1 hour'),

  -- Thread for t301 (Escalated Database upgrade issue)
  ('e3010101-3301-3301-3301-330101010101', 'f3010101-3301-3301-3301-330101010101', 'customer', null, 'Our database migration is stuck at 99%. It has been running for 45 minutes without progress. The app is completely offline.', false, now() - interval '3 hours'),
  ('e3010202-3301-3301-3301-330102020202', 'f3010101-3301-3301-3301-330101010101', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'This looks like a database deadlock during the indexing phase. Escalating to engineering lead.', true, now() - interval '2 hours'),

  -- Thread for t401 (Resolved reset link issue)
  ('e4010101-4401-4401-4401-440101010101', 'f4010101-4401-4401-4401-440101010101', 'customer', null, 'I did not receive the reset link. I checked spam.', false, now() - interval '2 days'),
  ('e4010202-4401-4401-4401-440102020202', 'f4010101-4401-4401-4401-440101010101', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Hi Peter, I checked our mail logs and it was blocked by Initechs inbound filter. I have manually whitelisted our domain. Please try triggering it now.', false, now() - interval '1 day'),
  ('e4010303-4401-4401-4401-440103030303', 'f4010101-4401-4401-4401-440101010101', 'customer', null, 'Got it! Password updated, thank you!', false, now() - interval '1 day'),
  ('e4010404-4401-4401-4401-440104040404', 'f4010101-4401-4401-4401-440101010101', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Glad to hear! Marking this ticket as resolved. Have a great day.', false, now() - interval '1 day')
on conflict (id) do nothing;

-- ── 14. Seed Escalations ──────────────────────────────────────────────────────
insert into public.escalation (id, ticket_id, from_user, to_user, reason, status, created_at)
values
  ('e1010101-1101-1101-1101-110101010101', 'f3010101-3301-3301-3301-330101010101', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Database upgrade lock deadlock during migration.', 'open', now() - interval '2 hours')
on conflict (id) do nothing;

-- ── 15. Seed Activity Logs ────────────────────────────────────────────────────
insert into public.ticket_activity (id, ticket_id, actor_id, action, previous_value, new_value, created_at)
values
  ('a1010101-1101-1101-1101-110101010101', 'f4010101-4401-4401-4401-440101010101', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'status_change', '{"status": "open"}', '{"status": "resolved"}', now() - interval '1 day'),
  ('a2010101-2201-2201-2201-220101010101', 'f3010101-3301-3301-3301-330101010101', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'status_change', '{"status": "open"}', '{"status": "escalated"}', now() - interval '2 hours'),
  ('a2020202-2202-2202-2202-220202020202', 'f3010101-3301-3301-3301-330101010101', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'assignment_change', '{"assigned_to": "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1"}', '{"assigned_to": "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2"}', now() - interval '2 hours')
on conflict (id) do nothing;
