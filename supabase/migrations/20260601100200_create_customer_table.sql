-- Migration: 20260601100200_create_customer_table
-- Purpose: Create customer table and RLS policies
-- Affected tables: customer

-- ── Up ────────────────────────────────────────────────────────────────────────
create table customer (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);

alter table customer enable row level security;

-- All authenticated users with a profile in the user table can read customers
create policy "customer_select"
  on customer for select
  using (
    exists (select 1 from "user" where id = auth.uid())
  );

-- Only admins can manage customers
create policy "customer_write_admin"
  on customer for all
  using (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  );

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop policy if exists "customer_write_admin" on customer;
-- drop policy if exists "customer_select" on customer;
-- drop table if exists customer;
