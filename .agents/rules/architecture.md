---
trigger: always_on
---

# Architecture Rules — Helix

## Overview

Helix is a single-page web application backed by Supabase. The architecture prioritises
agent-first speed: minimal round trips, optimistic UI updates, and event-driven real-time
sync. Every structural decision must trace back to reducing agent cognitive load and
keeping ticket resolution under 5 clicks from the inbox.

---

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React via Next.js App Router | SPA-style navigation; no full page reloads |
| Styling | Tailwind CSS | Utility-first; no CSS-in-JS |
| State | Zustand or React Context | Local UI state only; server state via Supabase |
| Backend / DB | Supabase (Postgres) | Primary data store |
| Auth | Supabase Auth | JWT-based; RLS enforced at DB level |
| Real-time | Supabase Realtime (WebSocket) | Ticket state changes, assignment updates |
| API layer | Supabase client SDK + Edge Functions | No custom REST server unless Edge Function is required |

---

## Folder Structure

> The `src/` tree below is the planned layout. Directories and files are created as
> features are built — the structure describes the target state.

```
/
├── .agents/
│   ├── rules/
│   │   ├── architecture.md
│   │   ├── code-style.md
│   │   ├── design-system.md
│   │   ├── error-handling.md
│   │   ├── realtime.md
│   │   └── security.md
│   │
│   └── skills/
│       ├── component-builder/SKILL.md
│       └── db-migration-runner/SKILL.md
│
├── src/
│   ├── middleware.ts           # Auth + role-based route guards
│   │
│   ├── app/                   # Next.js App Router pages / layouts
│   │   ├── (auth)/            # Login route group
│   │   ├── inbox/             # Ticket Inbox
│   │   ├── tickets/[id]/      # Ticket Detail View
│   │   ├── dashboard/         # Manager Overview
│   │   ├── settings/          # Admin user and role management
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                # Primitive design system components (Button, Badge, etc.)
│   │   ├── tickets/           # Ticket-domain components
│   │   ├── escalation/        # Escalation modal and flow
│   │   ├── dashboard/         # Manager dashboard widgets
│   │   └── layout/            # Shell, sidebar, navbar
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── browser.ts     # createBrowserClient — used in client components
│   │   │   ├── server.ts      # createServerClient — used in server components / route handlers
│   │   │   └── middleware.ts  # createServerClient for middleware (cookie-based auth)
│   │   ├── realtime/          # WebSocket channel setup and subscription hooks
│   │   └── shortcuts/         # Keyboard shortcut registry
│   │
│   ├── hooks/                 # Custom React hooks (useTickets, useEscalation, etc.)
│   ├── store/                 # Zustand stores for UI state
│   ├── types/                 # Shared TypeScript types and enums
│   └── utils/                 # Pure utility functions (formatting, SLA calc, etc.)
│
├── supabase/
│   ├── migrations/            # SQL migration files (timestamped)
│   ├── seed.sql               # Dev seed data
│   └── functions/
│       ├── escalate-ticket/   # Edge Function: atomic escalation ownership transfer
│       └── ...                # Additional Edge Functions as needed
│
└── public/
```

---

## Module Boundaries

### Frontend ↔ Supabase
- All DB reads and writes go through the **Supabase client SDK** or **server-side Supabase client** (never raw fetch to PostgREST).
- Business logic that must be server-authoritative (e.g. escalation ownership transfer) lives in **Supabase Edge Functions**, not client code.
- RLS policies are the **last line of access defence** — never rely solely on frontend guards.

### Supabase Client Instances
- **Browser client** (`lib/supabase/browser.ts`): `createBrowserClient` — used inside `'use client'` components for direct queries and Realtime subscriptions.
- **Server client** (`lib/supabase/server.ts`): `createServerClient` — used in Server Components, Route Handlers, and Server Actions. Reads cookies from the incoming request.
- **Middleware client** (`lib/supabase/middleware.ts`): `createServerClient` configured for Next.js middleware — refreshes the session cookie on every request.

### Real-time
- Subscribe to Supabase Realtime channels **per screen** — unsubscribe on unmount.
- Channels: `tickets` (inbox updates), `ticket:{id}` (detail view), `dashboard` (manager metrics).
- On WebSocket disconnect: surface a reconnecting indicator; fall back to read-only cached state — never silently fail.

### State Management
- **Server state** (tickets, customers, agents): owned by Supabase queries + Realtime subscriptions.
- **UI state** (selected filters, open modals, bulk selection): owned by Zustand stores.
- Do not duplicate server state into Zustand — derive from query results instead.

### Caching
- **SWR pattern**: Server state is treated as stale-while-revalidate. Initial data is fetched SSR, then kept fresh via Realtime pushes.
- **No client-side cache layer** (React Query, SWR library) — Supabase SDK's built-in caching + Realtime subscription updates are sufficient for MVP scale.
- **Dashboard metrics**: Aggregated Postgres views, re-queried every 30s via a client-side interval that triggers a refetch. Cached data shows a "last updated" timestamp.

---

## Data Flow — Ticket Update

```
Agent action (UI)
  → Optimistic UI update (Zustand)
  → Supabase SDK mutation
  → Supabase DB (RLS check)
  → Realtime broadcast to all subscribers
  → Reconcile UI with confirmed server state
  → Write audit log row (via DB trigger)
```

On mutation failure: roll back optimistic state and surface an error toast.

---

## Routing

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Supabase Auth sign-in |
| `/inbox` | Agent, Lead, Admin | Ticket Inbox (default post-login) |
| `/tickets/[id]` | Agent, Lead, Admin | Ticket Detail View |
| `/dashboard` | Lead, Admin | Manager Overview |
| `/settings` | Admin | User and role management |

- Unauthenticated users are redirected to `/login` via middleware.
- Role-based route guards are enforced in Next.js middleware using the JWT `role` claim.

---

## Real-time Conflict Resolution

- **Last-write-wins** — `updated_at` timestamp is compared; the most recent write persists.
- When a conflict is detected on the client, show a non-blocking timestamp indicator ("Updated just now by another agent") — never silently overwrite.
- Destructive actions (close, escalate) require a confirmation step to prevent accidental conflicts.

---

## Audit Trail

- Every ticket mutation (status change, assignment, escalation, message send) must produce a row in the `ticket_activity` table.
- This is enforced via **Postgres triggers**, not application code, so it cannot be bypassed.
- The audit log is read-only from the application layer.

---

## Error Handling

- **React Error Boundaries** wrap each route segment and major panel (inbox list, detail view, dashboard). A crashed panel never takes down the entire UI.
- **Mutation errors**: Optimistic UI is rolled back; a toast surfaces the error message with a retry action.
- **Global fallback**: `src/app/error.tsx` catches unhandled render errors. `src/app/not-found.tsx` handles unknown routes.
- **Edge Function errors**: The client receives a structured `{ error, code }` response. Network or 5xx errors show "Something went wrong. Please try again." with a retry button.

---

## Accessibility Architecture

- **Live regions**: A top-level `aria-live="polite"` region announces real-time ticket updates (e.g., "Ticket #123 was updated").
- **Focus management**: After navigation or modal open/close, focus is moved to the first interactive element (inbox) or the modal title. A `FocusTrap` utility in `lib/` handles modal focus containment.
- **Skip link**: A "Skip to content" link is the first tabbable element on every page.
- **Route announcements**: The `<title>` element is updated on every navigation to announce the current view to screen readers.
- All other accessibility requirements are defined in `design-system.md` (colours, touch targets, keyboard reachability).

---

## Performance Constraints

| Requirement | Implementation |
|-------------|---------------|
| Page load < 2.5s | SSR for initial inbox render; client-side pagination after |
| Real-time updates ≤ 3s | Supabase Realtime WebSocket channel |
| Large ticket threads | Lazy-load messages in batches of 20 |
| High ticket volume | Paginate inbox at 25 tickets per page; virtual scroll if > 100 visible |
| Dashboard metrics | Aggregated via Postgres views; re-fetched every 30s with stale timestamp indicator |

---

## Key Architectural Decisions

- **[ENG DECISION]** Event-driven updates for ticket state synchronisation — polling is forbidden.
- **[DESIGN DECISION]** Single-pane workflow for agents — no split-screen or drawer-heavy navigation on desktop.
- **[ENG DECISION]** Supabase RLS is the access control layer — no middleware-only guards.
- **[ENG DECISION]** Escalation ownership transfer is atomic — handled in a single Edge Function transaction to prevent partial state.
