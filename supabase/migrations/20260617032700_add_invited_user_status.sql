-- Migration: 20260617032700_add_invited_user_status
-- Purpose: Add 'invited' to user_status enum, and set up trigger on auth.users to automatically activate users on confirmation/login.

-- ── Up ────────────────────────────────────────────────────────────────────────

-- 1. Add 'invited' value to user_status enum
alter type user_status add value if not exists 'invited';

-- 2. Create trigger function to activate invited users when confirmed or signed in
create or replace function public.handle_user_auth_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null or new.last_sign_in_at is not null then
    update public."user"
    set status = 'active'
    where id = new.id and status = 'invited';
  end if;
  return new;
end;
$$;

-- 3. Create trigger on auth.users
drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update on auth.users
  for each row execute function public.handle_user_auth_confirmed();

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop trigger if exists on_auth_user_confirmed on auth.users;
-- drop function if exists public.handle_user_auth_confirmed;
-- Note: Altering enum values cannot be easily rolled back in a simple SQL command without recreating the type, which is generally not recommended in production.
