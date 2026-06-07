-- Migration: 20260601101000_create_dashboard_views
-- Purpose: Create secured database views for manager dashboard metrics
-- Affected tables: ticket, user, ticket_activity

-- ── Up ────────────────────────────────────────────────────────────────────────

-- 1. View for ticket counts grouped by status
create or replace view v_ticket_status_counts as
select status, count(*) as count
from ticket
where exists (
  select 1 from "user" 
  where id = auth.uid() 
  and role in ('lead', 'admin')
)
group by status;

-- 2. View for active SLA breaches (not resolved, past due date)
create or replace view v_sla_breach_count as
select count(*) as count
from ticket
where sla_due < now() 
and status != 'resolved'
and exists (
  select 1 from "user" 
  where id = auth.uid() 
  and role in ('lead', 'admin')
);

-- 3. View for agent workload distribution (unresolved tickets per user)
create or replace view v_agent_workload as
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

-- 4. View for 7-day resolution trend (daily count of tickets set to resolved)
create or replace view v_resolution_trend as
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
