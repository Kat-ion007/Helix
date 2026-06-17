-- Run this in the Supabase SQL Editor to:
-- 1. Fix the activation trigger (only fire on real sign-in, not email confirmation)
-- 2. Reset the wrongly-activated invited user back to 'invited'

-- ── Step 1: Fix the trigger function ─────────────────────────────────────────
create or replace function public.handle_user_auth_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only activate when the user completes their FIRST real sign-in.
  -- Supabase sets email_confirmed_at when the invite link is clicked (too early).
  -- last_sign_in_at is only populated after a full successful authentication.
  if (old.last_sign_in_at is null and new.last_sign_in_at is not null) then
    update public."user"
    set status = 'active'
    where id = new.id and status = 'invited';
  end if;
  return new;
end;
$$;

-- ── Step 2: Reset Kation's status back to 'invited' ──────────────────────────
-- They were marked active because of the premature email_confirmed_at trigger.
-- Once they set their password and log in, the trigger will correctly set them active.
update public."user"
set status = 'invited'
where email = 'okwuidegbekate2018@gmail.com'
  and status = 'active';

-- Verify the change:
select id, name, email, role, status from public."user" where email = 'okwuidegbekate2018@gmail.com';
