-- Migration: 20260615143000_change_dashboard_views_to_security_invoker
-- Purpose: Change dashboard views to security invoker to resolve Supabase Advisor security warnings and respect Row Level Security (RLS) on underlying tables.

-- ── Up ────────────────────────────────────────────────────────────────────────

-- 1. Update v_ticket_status_counts
drop view if exists v_ticket_status_counts;
create or replace view v_ticket_status_counts
with (security_invoker = true) as
select status, count(*) as count
from ticket
where exists (
  select 1 from "user" 
  where id = auth.uid() 
  and role in ('lead', 'admin')
)
group by status;

-- 2. Update v_sla_breach_count
drop view if exists v_sla_breach_count;
create or replace view v_sla_breach_count
with (security_invoker = true) as
select count(*) as count
from ticket
where sla_due < now() 
and status != 'resolved'
and exists (
  select 1 from "user" 
  where id = auth.uid() 
  and role in ('lead', 'admin')
);

-- 3. Update v_agent_workload
drop view if exists v_agent_workload;
create or replace view v_agent_workload
with (security_invoker = true) as
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

-- 4. Update v_resolution_trend
drop view if exists v_resolution_trend;
create or replace view v_resolution_trend
with (security_invoker = true) as
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

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop view if exists v_resolution_trend;
-- drop view if exists v_agent_workload;
-- drop view if exists v_sla_breach_count;
-- drop view if exists v_ticket_status_counts;
--
-- Recreate without security_invoker:
-- (Refer to migration 20260601101000_create_dashboard_views.sql)
