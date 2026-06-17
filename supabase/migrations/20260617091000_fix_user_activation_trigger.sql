-- Migration: 20260617091000_fix_user_activation_trigger
-- Purpose: Fix premature user activation. The previous trigger activated invited users
-- as soon as they clicked the invite link (email_confirmed_at set by Supabase).
-- This migration changes the condition to only activate on a real completed sign-in
-- (last_sign_in_at changing from null to a value).

-- ── Up ────────────────────────────────────────────────────────────────────────

-- Replace the trigger function to only fire on first sign-in, not on email confirmation.
-- We check that last_sign_in_at is newly set (OLD was null, NEW is not null).
create or replace function public.handle_user_auth_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only activate when the user completes their first real sign-in.
  -- Supabase sets email_confirmed_at when the invite link is clicked (too early).
  -- last_sign_in_at is only set after a full successful authentication.
  if (old.last_sign_in_at is null and new.last_sign_in_at is not null) then
    update public."user"
    set status = 'active'
    where id = new.id and status = 'invited';
  end if;
  return new;
end;
$$;

-- The trigger itself (on_auth_user_confirmed on auth.users) already exists and
-- calls this function — no need to recreate it.

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- Restore previous (broken) behaviour:
-- create or replace function public.handle_user_auth_confirmed()
-- returns trigger language plpgsql security definer set search_path = public as $$
-- begin
--   if new.email_confirmed_at is not null or new.last_sign_in_at is not null then
--     update public."user" set status = 'active' where id = new.id and status = 'invited';
--   end if;
--   return new;
-- end;
-- $$;
