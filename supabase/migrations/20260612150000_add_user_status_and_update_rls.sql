-- Migration: 20260612150000_add_user_status_and_update_rls
-- Purpose: Add status enum/column to user table, and update get_my_role function
-- Affected tables: user

-- ── Up ────────────────────────────────────────────────────────────────────────

-- 1. Create user_status enum type if it does not exist
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_status') then
    create type user_status as enum ('active', 'inactive');
  end if;
end;
$$;

-- 2. Add status column to user table with default 'active'
alter table "user" add column if not exists status user_status not null default 'active';

-- 3. Re-create public.get_my_role with security definer and status check
create or replace function public.get_my_role()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_status text;
begin
  select role::text, status::text into v_role, v_status from "user" where id = auth.uid();
  if v_status = 'inactive' then
    return null;
  end if;
  return v_role;
end;
$$;

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- To reverse this migration:
-- create or replace function public.get_my_role()
-- returns text
-- language plpgsql
-- security definer
-- set search_path = public
-- as $$
-- declare
--   v_role text;
-- begin
--   select role::text into v_role from "user" where id = auth.uid();
--   return v_role;
-- end;
-- $$;
-- alter table "user" drop column if exists status;
-- drop type if exists user_status;
