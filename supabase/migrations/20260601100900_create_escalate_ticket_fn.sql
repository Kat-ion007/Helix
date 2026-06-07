-- Migration: 20260601100900_create_escalate_ticket_fn
-- Purpose: Create atomic escalate_ticket RPC function
-- Affected tables: ticket, escalation

-- ── Up ────────────────────────────────────────────────────────────────────────
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

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop function if exists escalate_ticket;
