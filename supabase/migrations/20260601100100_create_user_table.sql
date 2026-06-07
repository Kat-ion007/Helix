-- Migration: 20260601100100_create_user_table
-- Purpose: Create user table, user_role enum, and RLS policies
-- Affected tables: user

-- ── Up ────────────────────────────────────────────────────────────────────────
create type user_role as enum ('agent', 'lead', 'admin');

create table "user" (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  role        user_role not null default 'agent',
  created_at  timestamptz not null default now()
);

-- RLS
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

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop policy if exists "user_all_admin" on "user";
-- drop policy if exists "user_select" on "user";
-- drop table if exists "user";
-- drop type if exists user_role;
