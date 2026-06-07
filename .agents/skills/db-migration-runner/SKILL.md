# SKILL: DB Migration Runner

## Purpose

Create, validate, and apply Supabase database migrations for Helix. Every schema change
— new table, new column, new policy, new index, new trigger — goes through a migration
file. No direct schema edits in the Supabase dashboard on shared or production environments.

---

## When to Use This Skill

- Adding a new table or column
- Modifying an existing table (rename, add/drop column, change type)
- Creating or updating RLS policies
- Adding indexes for query performance
- Creating Postgres functions or triggers (e.g. audit log trigger)
- Seeding reference data (roles, macro templates, etc.)
- Rolling back a migration that caused issues

---

## Migration File Conventions

### Naming

```
supabase/migrations/<timestamp>_<description>.sql
```

Timestamp format: `YYYYMMDDHHMMSS` (Supabase CLI generates this automatically).
Description: lowercase, underscores, concise.

For rollbacks, optionally create a paired down file:
```
supabase/migrations/<timestamp>_<description>.down.sql
```
This must be applied manually via `supabase db execute` — Supabase does not auto-rollback.

```
20260601120000_create_ticket_table.sql
20260601120500_add_sla_due_to_ticket.sql
20260601121000_create_ticket_activity_trigger.sql
20260601121500_rls_policies_ticket.sql
```

### Structure of every migration file

```sql
-- Migration: <timestamp>_<description>
-- Purpose: <one sentence explaining what this migration does>
-- Affected tables: <comma-separated list>

-- ── Up ────────────────────────────────────────────────────────────────────────

-- Your SQL here

-- ── Rollback (manual — Supabase does not auto-rollback) ───────────────────────
-- To reverse this migration manually:
-- <DROP / ALTER statements to undo the above>
```

---

## Core Schema — Initial Migrations

Run these in order on a fresh project.

### 1. Enable UUID extension

```sql
-- 20260601100000_enable_uuid.sql
-- gen_random_uuid() (Postgres 13+) does not require an extension.
-- This migration enables uuid-ossp for legacy compatibility if needed.
create extension if not exists "uuid-ossp";
```

### 2. User table

```sql
-- 20260601100100_create_user_table.sql
create type user_role as enum ('agent', 'lead', 'admin');

create table "user" (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  role        user_role not null default 'agent',
  created_at  timestamptz not null default now()
);

-- RLS
alter table "user" enable row level security;

create policy "Users can read own profile"
  on "user" for select
  using (auth.uid() = id);

create policy "Leads and admins can read all users"
  on "user" for select
  using (
    exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

create policy "Admins can manage users"
  on "user" for all
  using (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  );
```

### 3. Customer table

```sql
-- 20260601100200_create_customer_table.sql
create table customer (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);

alter table customer enable row level security;

create policy "Authenticated users can read customers"
  on customer for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage customers"
  on customer for all
  using (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  );
```

### 4. Ticket table

```sql
-- 20260601100300_create_ticket_table.sql
create type ticket_status   as enum ('open', 'pending', 'resolved', 'escalated');
create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');

create table ticket (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  status       ticket_status   not null default 'open',
  priority     ticket_priority not null default 'medium',
  customer_id  uuid not null references customer(id),
  assigned_to  uuid references "user"(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  sla_due      timestamptz
);

-- Indexes for common query patterns
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

alter table ticket enable row level security;

create policy "Agents see assigned or open tickets"
  on ticket for select
  using (
    assigned_to = auth.uid()
    or status = 'open'
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

create policy "Agents update assigned tickets"
  on ticket for update
  using (
    assigned_to = auth.uid()
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

create policy "Leads and admins insert tickets"
  on ticket for insert
  with check (
    exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );
```

### 5. Message table

```sql
-- 20260601100400_create_message_table.sql
create type message_sender as enum ('agent', 'customer');

create table message (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references ticket(id) on delete cascade,
  sender_type  message_sender not null,
  sender_id    uuid references "user"(id),  -- null for customer messages
  content      text not null,
  is_internal  boolean not null default false,
  created_at   timestamptz not null default now()
);

create index idx_message_ticket_id on message(ticket_id);

alter table message enable row level security;

create policy "Users can read messages on accessible tickets"
  on message for select
  using (
    exists (
      select 1 from ticket t
      where t.id = ticket_id
        and (
          t.assigned_to = auth.uid()
          or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
        )
    )
  );

create policy "Agents can insert messages on assigned tickets"
  on message for insert
  with check (
    exists (
      select 1 from ticket t
      where t.id = ticket_id
        and (
          t.assigned_to = auth.uid()
          or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
        )
    )
  );
```

### 6. Escalation table

```sql
-- 20260601100500_create_escalation_table.sql
create type escalation_status as enum ('open', 'closed');

create table escalation (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references ticket(id),
  from_user   uuid not null references "user"(id),
  to_user     uuid not null references "user"(id),
  reason      text,
  status      escalation_status not null default 'open',
  created_at  timestamptz not null default now()
);

create index idx_escalation_ticket_id on escalation(ticket_id);

alter table escalation enable row level security;

create policy "Users can read escalations they are involved in"
  on escalation for select
  using (
    from_user = auth.uid()
    or to_user = auth.uid()
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

create policy "Authenticated users can create escalations"
  on escalation for insert
  with check (auth.role() = 'authenticated');
```

### 7. Ticket activity (audit log) table + trigger

```sql
-- 20260601100600_create_ticket_activity.sql
create table ticket_activity (
  id              uuid primary key default gen_random_uuid(),
  ticket_id       uuid not null references ticket(id),
  actor_id        uuid references "user"(id),
  action          text not null,
  previous_value  jsonb,
  new_value       jsonb,
  created_at      timestamptz not null default now()
);

-- Append-only: no update or delete
alter table ticket_activity enable row level security;

create policy "Users can read activity on accessible tickets"
  on ticket_activity for select
  using (
    exists (
      select 1 from ticket t
      where t.id = ticket_id
        and (
          t.assigned_to = auth.uid()
          or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
        )
    )
  );

-- Trigger: auto-log ticket status and assignment changes
-- auth.uid() resolves from the requesting user's JWT session.
-- The function uses security definer with an explicit search_path
-- to prevent search-path injection attacks.
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
```

### 8. Macro table + seed data

```sql
-- 20260601100700_create_macro_table.sql
create table macro (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  content     text not null,
  created_at  timestamptz not null default now()
);

alter table macro enable row level security;

create policy "Authenticated users can read macros"
  on macro for select
  using (auth.role() = 'authenticated');

-- Seed default macro templates (idempotent — safe to re-run)
insert into macro (name, content) values
  ('Request more info', 'Could you please provide additional details about this issue?'),
  ('Acknowledged', 'Thanks for reaching out. Our team is looking into this.'),
  ('Resolved', 'This issue has been resolved. Please reopen if the issue persists.')
on conflict (name) do nothing;
```

---

## Running Migrations

### Local development

```bash
# Apply all pending migrations
supabase db push

# Or run a specific file
supabase db execute --file supabase/migrations/<filename>.sql

# Apply a rollback file
supabase db execute --file supabase/migrations/<filename>.down.sql

# Reset local DB and re-run all migrations (destructive — dev only)
supabase db reset
```

### Generating a new migration

```bash
# Let Supabase CLI create a timestamped file
supabase migration new <description>
# Creates: supabase/migrations/<timestamp>_<description>.sql
# Then write your SQL in the generated file
```

### Applying to production

```bash
# Link to production project first (one-time)
supabase link --project-ref <your-project-ref>

# Push migrations to production
supabase db push --linked
```

### Regenerating TypeScript types

After every migration, regenerate the typed Supabase client:

```bash
supabase gen types typescript --linked > src/types/supabase.ts
```

This keeps `@/types` imports in sync with the actual database schema.

---

## Validation Checklist — Every Migration

- [ ] File is timestamped and named descriptively
- [ ] Header comment explains purpose and affected tables
- [ ] `enable row level security` added to every new table
- [ ] RLS policies created for all roles that need access
- [ ] Rollback SQL documented in comments (or paired `.down.sql` file)
- [ ] Indexes added for all foreign keys and common filter columns
- [ ] `updated_at` columns have a `before update` trigger that calls `now()`
- [ ] `security definer` functions always include `set search_path = <schema>`
- [ ] Migration tested on local `supabase db reset` before pushing to staging
- [ ] No direct references to `auth.users` beyond `id` foreign key
- [ ] TypeScript types regenerated after migration (`supabase gen types`)

---

## Common Pitfalls

| Pitfall | Avoidance |
|---------|-----------|
| Forgetting `enable row level security` | Always add immediately after `create table` |
| Missing index on FK columns | Add `create index` for every `references` FK |
| Enum values not matching TypeScript types | Regenerate types with `supabase gen types` after every migration |
| `auth.uid()` returning null in triggers | Use `security definer` with `set search_path = public` — this lets the function access the session JWT from the calling user's context. auth.uid() resolves reliably when the trigger runs inside an authenticated request transaction |
| Migration order dependency | Always check referenced tables exist in earlier migrations |
| Missing `search_path` on `security definer` functions | Always add `set search_path = <schema>` to prevent search-path injection attacks |
