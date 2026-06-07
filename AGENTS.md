# AGENTS.md — Helix Project Context

## What is Helix?

Helix is a **web-based customer support admin panel** (MVP v1.0). Its core purpose is to consolidate ticket management, customer context, and resolution tools into a single, fast-moving interface — eliminating the context-switching that slows support agents down.

> **Design principle:** Every interaction defaults to the fastest viable path. Every status change is intentional. Every escalation preserves full context.

---

## Who Are the Users?

| Role | Description | Primary Goal |
|------|-------------|--------------|
| **Support Agent** | Primary user. Handles and resolves tickets. | Resolve tickets quickly with full context, no tool switching |
| **Team Lead / Manager** | Monitors agents, manages escalations. | Real-time SLA visibility and workload balance |
| **Admin** | Manages users, roles, and permissions. | Zero access misconfiguration |

---

## Core Features (MVP Scope)

These are **in scope** for v1.0:

- **Ticket Inbox** — paginated list with filtering (status, priority, assigned agent), sorting, bulk actions, and real-time updates
- **Ticket Detail View** — full conversation thread, customer metadata sidebar, status updates, assignment changes, internal notes
- **Ticket Status Management** — `open`, `pending`, `resolved`, `escalated`
- **Escalation Flow** — modal with preloaded ticket context, target team selection, optional notes, instant ownership transfer
- **Macros** — predefined reply templates for quick responses
- **Keyboard Shortcuts** — `Enter` open, `J/K` navigate, `C` close, `E` escalate, `/` search
- **Manager Dashboard** — total open tickets, SLA breach count, agent workload distribution, resolution trend chart
- **Search & Filters**
- **Real-time updates** via WebSocket (reflect within 2–3 seconds)
- **Authentication** via Supabase Auth

### Out of Scope (Do Not Build in v1)

- AI response suggestions or automation
- Multi-channel support (email, chat, voice)
- Knowledge base
- Customer-facing portal
- Advanced reporting dashboards
- Workflow automation rules engine
- Multi-language support
- Billing or subscription management

---

## Tech Stack & Constraints

| Concern | Decision |
|---------|----------|
| **Backend** | Supabase (primary — auth, database, real-time) |
| **Real-time** | WebSocket / Supabase Realtime — updates must reflect in 2–3s |
| **State sync** | Event-driven updates for ticket state |
| **Conflict resolution** | Last-write-wins with timestamp indicator |
| **Audit trail** | All ticket actions must be logged |
| **Performance** | Page load < 2.5s on standard broadband |
| **Accessibility** | WCAG 2.1 AA, keyboard-only navigation, ARIA labels, screen reader support |
| **Mobile** | Fully responsive — stacked cards on mobile, full-screen ticket detail, collapsible sidebar drawer |
| **Compliance** | Basic GDPR data handling principles |

---

## Data Models

### User
\```
id: uuid
name: string
email: string
role: enum (agent | lead | admin)
created_at: timestamp
\```

### Ticket
\```
id: uuid
title: string
description: text
status: enum (open | pending | resolved | escalated)
priority: enum (low | medium | high | urgent)
customer_id: uuid
assigned_to: uuid
created_at: timestamp
updated_at: timestamp
SLA_due: timestamp
\```

### Customer
\```
id: uuid
name: string
email: string
metadata: json
\```

### Message
\```
id: uuid
ticket_id: uuid
sender_type: enum (agent | customer)
content: text
created_at: timestamp
\```

### Escalation
\```
id: uuid
ticket_id: uuid
from_user: uuid
to_user: uuid
reason: text
status: enum (open | closed)
\```

---

## Information Architecture

\```
App
├── Ticket Inbox
│   ├── Filters (status, priority, assigned)
│   ├── Search
│   └── Bulk Actions
│
├── Ticket Detail View
│   ├── Customer Context Panel
│   ├── Conversation Thread
│   └── Action Panel (reply, escalate, close, internal note)
│
├── Quick Actions
│   ├── Macros
│   └── Keyboard Shortcuts
│
├── Escalations
│   ├── Active Escalations
│   └── Handoff History
│
└── Manager Dashboard
    ├── SLA Metrics
    ├── Agent Workload Distribution
    └── Ticket Volume Trends
\```

---

## Key User Flows

### Agent Flow (Primary)
1. Log in → land on Ticket Inbox
2. Filter/sort tickets by priority
3. Open Ticket Detail View
4. Read full customer context
5. Respond via quick reply (macro) or manual input
6. Update ticket status
7. Escalate if needed → move to next ticket

**Target:** Resolve a ticket in **< 5 clicks** from inbox.

### Escalation Flow
1. Agent selects "Escalate" (`E`)
2. Modal opens with ticket context preloaded
3. Agent selects target team or manager
4. Adds optional notes
5. Submits → system transfers full context and updates ownership in real time

---

## Edge Cases to Handle

| Screen | Edge Case | Expected Behaviour |
|--------|-----------|-------------------|
| Ticket Inbox | Empty inbox | "No tickets available" empty state |
| Ticket Inbox | API failure | Retry state |
| Ticket Inbox | Real-time sync conflict | Last-write-wins + timestamp indicator |
| Ticket Detail | Missing customer data | Placeholder profile |
| Ticket Detail | Large message thread | Lazy load messages |
| Ticket Detail | Failed message send | Retry queue state |
| Escalation | Escalation failure | Rollback ownership change |
| Escalation | Missing target team | Validation error |
| Escalation | Duplicate escalation | Prevent double submission |
| Dashboard | No data | Empty state cards |
| Dashboard | Partial data load | Skeleton loaders |
| Dashboard | Stale metrics | Last updated timestamp |
| Global | Duplicate ticket creation | Prevent on submission |
| Global | Concurrent updates from multiple agents | Event-driven sync, last-write-wins |
| Global | Offline mode | Read-only fallback |
| Global | Unauthorized access | Redirect + auth check |
| Global | WebSocket disconnect mid-session | Reconnect with state recovery |

---

## Keyboard Shortcuts Reference

| Action | Shortcut |
|--------|----------|
| Open ticket | `Enter` |
| Next ticket | `J` |
| Previous ticket | `K` |
| Close ticket | `C` |
| Escalate | `E` |
| Search | `/` |

> Shortcuts are disabled on mobile and replaced with touch actions.

---

## Non-Functional Requirements

- Page load time < 2.5s on standard broadband
- Real-time updates within 2–3 seconds
- Support concurrent updates without data loss
- Responsive on tablet and mobile
- Audit trail maintained for all ticket changes
- WCAG 2.1 AA accessibility compliance
- GDPR-compliant data handling

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Ticket resolution time | −25% from baseline |
| SLA compliance rate | +20% improvement |
| Agent throughput | +15% tickets/hour |
| Escalation accuracy | < 5% incorrect escalations |
| System response time | < 2.5s |

---

## Acceptance Criteria

- [ ] Agents can resolve a ticket in < 5 clicks from inbox
- [ ] All ticket updates reflect in real time (≤ 3s)
- [ ] Manager dashboard displays live aggregated data
- [ ] Escalation preserves full ticket context
- [ ] System remains usable under 1,000 concurrent tickets
- [ ] Keyboard shortcuts work across all main flows
- [ ] WCAG 2.1 AA standards met

---

## Assumptions

- Tickets are already ingested into the system (no ingestion pipeline in scope)
- Agents operate in a single timezone or timestamps are normalized
- No external CRM integration required for MVP
- Basic role-based access control (agent / lead / admin) is sufficient