-- Migration: 20260601100700_create_macro_table
-- Purpose: Create macro table, RLS policies, and seed default macros
-- Affected tables: macro

-- ── Up ────────────────────────────────────────────────────────────────────────
create table macro (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- RLS
alter table macro enable row level security;

-- Any authenticated user with a profile can read macros
create policy "macro_select"
  on macro for select
  using (
    exists (select 1 from "user" where id = auth.uid())
  );

-- Only admins can write macros
create policy "macro_write_admin"
  on macro for all
  using (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  );

-- Seed default macro templates (idempotent)
insert into macro (name, content) values
  ('Request more info', 'Could you please provide additional details about this issue?'),
  ('Acknowledged', 'Thanks for reaching out. Our team is looking into this.'),
  ('Resolved', 'This issue has been resolved. Please reopen if the issue persists.')
on conflict (name) do nothing;

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop policy if exists "macro_write_admin" on macro;
-- drop policy if exists "macro_select" on macro;
-- drop table if exists macro;
