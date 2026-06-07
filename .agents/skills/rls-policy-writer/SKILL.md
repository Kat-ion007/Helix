# SKILL: RLS Policy Writer

## Purpose

Write correct Row Level Security policies for Helix's three-role model
(agent / lead / admin) across all tables. RLS is the authoritative security layer —
a missing or misconfigured policy silently exposes or blocks data. Use this skill
every time a new table is created or an existing policy needs updating.

These policies also govern **Supabase Realtime subscriptions** — the same row-level
checks apply to WebSocket broadcasts. No separate Realtime policy is needed.

---

## Role Reference

| Role | What they can access |
|------|---------------------|
| `agent` | Own profile, assigned + open tickets, messages on accessible tickets, own escalations |
| `lead` | All tickets, all messages, all escalations, all user profiles (read) |
| `admin` | Full access to everything |

Role is stored in `user.role` and must be checked via a subquery — never trust
a client-supplied value. Never use `auth.role()` to gate data access — it only
confirms the user is logged in, not that they have a profile in the `user` table.

---

## Role Check Subquery

Use this exact pattern for every role check.

```sql
-- ✅ Correct — checks role from DB, not from client claim or auth.role()
exists (
  select 1 from "user"
  where id = auth.uid()
  and role = 'admin'
)

-- For multiple roles
exists (
  select 1 from "user"
  where id = auth.uid()
  and role in ('lead', 'admin')
)
```

---

## Policy Templates Per Table

### `user` table

```sql
alter table "user" enable row level security;

-- Users can read own profile; leads and admins can read all profiles
create policy "user_select"
  on "user" for select
  using (
    auth.uid() = id
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

-- Only admins can insert, update, delete users
create policy "user_all_admin"
  on "user" for all
  using (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  );
```

---

### `ticket` table

```sql
alter table ticket enable row level security;

-- Agents see their assigned tickets and all open (unassigned) tickets
create policy "ticket_select_agent"
  on ticket for select
  using (
    assigned_to = auth.uid()
    or assigned_to is null
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

-- Agents can update only their assigned tickets
create policy "ticket_update_agent"
  on ticket for update
  using (
    assigned_to = auth.uid()
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

-- Only leads and admins can create tickets
create policy "ticket_insert_lead_admin"
  on ticket for insert
  with check (
    exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

-- Only admins can delete tickets
create policy "ticket_delete_admin"
  on ticket for delete
  using (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  );
```

---

### `message` table

```sql
alter table message enable row level security;

-- Users can read messages on tickets they can access
create policy "message_select"
  on message for select
  using (
    exists (
      select 1 from ticket t
      where t.id = ticket_id
      and (
        t.assigned_to = auth.uid()
        or t.assigned_to is null
        or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
      )
    )
  );

-- Agents can insert messages on assigned or open tickets; leads/admins on all
create policy "message_insert"
  on message for insert
  with check (
    exists (
      select 1 from ticket t
      where t.id = ticket_id
      and (
        t.assigned_to = auth.uid()
        or t.assigned_to is null
        or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
      )
    )
  );

-- No update or delete policies — messages are immutable once sent.
-- RLS default (no policy = no access) enforces this automatically.
```

---

### `customer` table

```sql
alter table customer enable row level security;

-- All agents and leads can read customers (must have a profile in user table)
create policy "customer_select"
  on customer for select
  using (
    exists (select 1 from "user" where id = auth.uid())
  );

-- Only admins can insert, update, delete customers
create policy "customer_write_admin"
  on customer for all
  using (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  );
```

---

### `escalation` table

```sql
alter table escalation enable row level security;

-- Users see escalations they are the sender or receiver of; leads/admins see all
create policy "escalation_select"
  on escalation for select
  using (
    from_user = auth.uid()
    or to_user = auth.uid()
    or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );

-- Any agent with a profile can create an escalation
create policy "escalation_insert"
  on escalation for insert
  with check (
    exists (select 1 from "user" where id = auth.uid())
  );

-- Only leads and admins can close (update) escalations
create policy "escalation_update_lead_admin"
  on escalation for update
  using (
    exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
  );
```

---

### `ticket_activity` table (append-only audit log)

```sql
alter table ticket_activity enable row level security;

-- Users can read activity on tickets they can access
create policy "ticket_activity_select"
  on ticket_activity for select
  using (
    exists (
      select 1 from ticket t
      where t.id = ticket_id
      and (
        t.assigned_to = auth.uid()
        or exists (select 1 from "user" where id = auth.uid() and role in ('lead', 'admin'))
      )
    )
  );

-- Insert only via DB trigger (security definer) — no direct client insert
-- No update policy (explicitly denied)
-- No delete policy (explicitly denied)
```

---

### `macro` table

```sql
alter table macro enable row level security;

-- Any agent with a profile can read macros
create policy "macro_select"
  on macro for select
  using (
    exists (select 1 from "user" where id = auth.uid())
  );

-- Only admins can insert, update, delete macros
create policy "macro_write_admin"
  on macro for all
  using (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from "user" where id = auth.uid() and role = 'admin')
  );
```

---

## Adding a New Table — Required Steps

1. Always add `alter table <table> enable row level security;` immediately after `create table`.
2. Write SELECT policy first — then INSERT, UPDATE, DELETE only where needed.
3. Use the `user` table subquery pattern for role checks — never `auth.role()` or `current_user`.
4. Every `for all` policy must include both `using` and `with check` — `using` alone does not cover INSERT.
5. Test each policy with three users: one agent, one lead, one admin.
6. Verify that an agent cannot access another agent's data by querying directly.

---

## Testing a Policy Locally

```sql
-- Impersonate a specific user to test their RLS view
set role authenticated;
set request.jwt.claims = '{"sub": "<agent-user-uuid>", "role": "authenticated"}';

-- Now query as if you are that user
select * from ticket;  -- should only return assigned + open tickets for this agent

-- Reset
reset role;
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Forgetting `enable row level security` | Add immediately after `create table` — RLS is off by default |
| Using `auth.role()` for role check | Always use the subquery pattern against the `user` table |
| Using `current_user` for role check | Use the subquery pattern: `exists (select 1 from "user" where id = auth.uid() ...)` |
| No policy = no access | With RLS enabled and no matching policy, all rows are invisible — always write at least a SELECT policy |
| `for all` with only `using` — missing `with check` | `using` covers SELECT/UPDATE/DELETE; `with check` is required for INSERT. Always add both |
| Forgetting `with check` on INSERT | `using` applies to reads, `with check` applies to writes — both needed for INSERT |

---

## Checklist — Every New Table

- [ ] `alter table <table> enable row level security;` present
- [ ] SELECT policy defined for every role that needs read access
- [ ] INSERT policy uses `with check`, not `using`
- [ ] `for all` policies include both `using` and `with check`
- [ ] All role checks use the `user` table subquery — never `auth.role()`
- [ ] UPDATE and DELETE policies only where the role should have write access
- [ ] `ticket_activity` has no UPDATE or DELETE policy
- [ ] Realtime subscriptions governed by the same policies — no separate config needed
- [ ] Tested with agent, lead, and admin user in local Supabase
- [ ] Policy names follow convention: `<table>_<operation>_<role>` (e.g. `ticket_update_agent`)
