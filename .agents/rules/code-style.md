---
trigger: always_on
---

# Code Style Rules — Helix

## Guiding Principle

Code in Helix should be **readable at a glance**. Support agents work under pressure;
the engineers building their tools should too. Prefer explicitness over cleverness.
If a future developer has to pause to understand what a block does, rewrite it.

---

## Language

- **TypeScript strictly everywhere** — `strict: true` in `tsconfig.json`. No `any`,
  no `@ts-expect-error` without an explaining comment. Prefer `@ts-expect-error`
  over `@ts-ignore` — it errors when the suppression is no longer needed.
- All files use `.ts` or `.tsx`. No `.js` or `.jsx` files in `src/`.
- Prefer `async/await` over `.then()` chains — they are easier to read and debug.

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Components | PascalCase | `TicketDetailView`, `EscalationModal` |
| Hooks | camelCase prefixed `use` | `useTicketInbox`, `useRealtime` |
| Utilities | camelCase | `formatSLADue`, `getPriorityColour` |
| Types / Interfaces | PascalCase | `Ticket`, `EscalationPayload` |
| Enums | PascalCase, values SCREAMING_SNAKE | `TicketStatus.OPEN` |
| Supabase tables | snake_case | `ticket_activity`, `escalation` |
| Module-level constants | SCREAMING_SNAKE_CASE | `MAX_BULK_SELECT`, `SLA_WARNING_THRESHOLD_MS` |
| Files (components) | kebab-case | `ticket-detail-view.tsx` |
| Files (hooks/utils) | kebab-case | `use-ticket-inbox.ts` |
| Zustand store files | kebab-case in `src/store/` | `ticket-store.ts`, `inbox-filter-store.ts` |

---

## TypeScript

```ts
// ✅ Always type function return values explicitly
function getTicketLabel(ticket: Ticket): string { ... }

// ✅ Use type for unions/intersections, interface for object shapes
type TicketStatus = 'open' | 'pending' | 'resolved' | 'escalated'
interface Ticket {
  id: string
  status: TicketStatus
  priority: TicketPriority
  // ...
}

// ❌ Never use `any`
const data: any = response.data  // WRONG

// ✅ Use unknown + narrowing instead
const data: unknown = response.data
if (isTicket(data)) { ... }

// ✅ Non-null assert only when you can prove it — add a comment why
const el = document.getElementById('inbox')!  // mounted before this runs
```

---

## React Components

- **Functional components only** — no class components.
- **Server Components by default** — only add `'use client'` when the component uses
  hooks (`useState`, `useEffect`, `useContext`), event handlers (`onClick`, `onSubmit`),
  browser-only APIs, or custom hooks that depend on these.
- Keep components **single-responsibility**: one component does one job.
- Split when a component exceeds ~150 lines or has more than 3 internal concerns.
- Co-locate component-specific types in the same file unless shared across modules.
- Wrap list item components with `React.memo` to prevent unnecessary re-renders.
- Use `useCallback` for callback props passed to memoized children. Use `useMemo`
  for expensive computations. Do not add them pre-emptively — profile first.

```tsx
// ✅ Good — props typed inline for small components, named interface for larger ones
interface TicketRowProps {
  ticket: Ticket
  isSelected: boolean
  onSelect: (id: string) => void
}

export function TicketRow({ ticket, isSelected, onSelect }: TicketRowProps) {
  return (...)
}

// ❌ Never use default exports for components (hard to rename/search)
export default function TicketRow() { ... }  // WRONG
```

---

## Hooks

- Custom hooks handle **one concern** (data fetching, subscription, keyboard shortcuts).
- Never mix data-fetching logic into UI components — extract to a `use*.ts` hook.
- Always clean up subscriptions in `useEffect` return.
- List all dependencies in the dependency array. Enable the `exhaustive-deps`
  ESLint rule — never suppress it.

```ts
// ✅ Clean up Supabase Realtime subscriptions
useEffect(() => {
  const channel = supabase.channel('tickets').on(...)
  channel.subscribe()
  return () => { supabase.removeChannel(channel) }
}, [])
```

---

## Data Fetching & Async

- Always use `async/await`. Never use `.then()` / `.catch()` chains in business logic.
- Wrap all async operations in try/catch. Surface errors via toast.
- Use `AbortController` for fetch-based requests that should cancel on unmount.

```ts
async function loadTickets(): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase.from('ticket').select('...')
    if (error) throw error
    return data
  } catch (err) {
    toast.error('Failed to load tickets.')
    console.error('[loadTickets]', err)
    return []
  }
}
```

---

## Supabase Queries

- Use the **typed Supabase client** generated from your schema (`supabase gen types`).
- Always handle the `{ data, error }` destructure — never ignore `error`.
- Use `select()` with explicit columns — never `select('*')` in production code.

```ts
// ✅ Explicit columns, error handled
const { data: tickets, error } = await supabase
  .from('ticket')
  .select('id, title, status, priority, assigned_to, SLA_due, updated_at')
  .eq('status', 'open')
  .order('SLA_due', { ascending: true })

if (error) {
  console.error('[useTicketInbox]', error.message)
  throw error
}

// ❌ Never do this
const { data } = await supabase.from('ticket').select('*')
```

---

## Error Handling

- All async operations must be wrapped in try/catch or handle the `error` return.
- **Always surface errors to the user via a toast notification.** Use `console.error`
  with a `[ModuleName]` prefix for logging in addition — never as a replacement.
- Rollback optimistic updates on failure.

```ts
try {
  await updateTicketStatus(ticketId, 'resolved')
} catch (err) {
  rollbackOptimisticUpdate(ticketId)
  toast.error('Failed to update ticket. Please try again.')
  console.error('[TicketDetailView]', err)
}
```

---

## State

- **No prop drilling beyond 2 levels** — use context or Zustand store.
- Keep Zustand stores **small and focused** (one store per domain: `useTicketStore`,
  `useInboxFilterStore`). File per store in `src/store/`, named `kebab-case`.
- Derive computed values inside selectors, not in components.

```ts
// ✅ Derive in selector
const urgentCount = useTicketStore(state =>
  state.tickets.filter(t => t.priority === 'urgent').length
)

// ❌ Not in component render
const urgentCount = tickets.filter(t => t.priority === 'urgent').length
```

---

## Imports

- Use **absolute imports** from `@/` alias (configured in `tsconfig.json`).
- Order: external packages → internal absolute → relative. Separated by blank lines.
- No barrel `index.ts` files unless a module has 5+ exports.
- Enforce ordering with `@trivago/prettier-plugin-sort-imports` or
  `eslint-plugin-import` — do not rely on manual sorting.

```ts
import { useEffect, useState } from 'react'
import { format } from 'date-fns'

import { useTicketStore } from '@/store/ticket-store'
import { formatSLADue } from '@/utils/sla'

import { TicketRow } from './ticket-row'
```

---

## Formatting

- **Prettier** is the formatter — do not manually format. Run on save.
- **ESLint** with `eslint-config-next` + `@typescript-eslint` — zero warnings in CI.
- Indentation: 2 spaces. Single quotes. No semicolons (enforced by Prettier `semi: false`).
- Max line length: 100 characters.

---

## Comments

- **Why, not what.** Code describes what; comments explain why a decision was made.
- Use `// TODO:` for known gaps — include a ticket reference if possible.
- Use `// FIXME:` for known bugs that are deferred.
- No commented-out code committed to main.

```ts
// SLA warning threshold is 30 minutes based on team SLA agreement (see PRD success metrics)
const SLA_WARNING_MS = 30 * 60 * 1000
```

---

## Testing

- Framework: **Vitest** + **Testing Library** (React Testing Library + user-event).
- Unit test pure utilities in `utils/` and complex hook logic.
- Integration test critical flows: ticket status update, escalation flow, bulk actions.
- Name test files `*.test.ts` / `*.test.tsx` co-located with the module.
- Use **descriptive test names** that read as sentences.
- Cover: default render, user interaction, loading state, empty state, error state,
  keyboard navigation, and ARIA attribute presence.

```ts
it('marks ticket as escalated and transfers ownership when escalation is submitted', () => { ... })
```

---

## What the Agent Must Never Do

- Never use `any` in TypeScript.
- Never use `select('*')` against Supabase tables.
- Never swallow errors silently (`catch (err) {}`).
- Never commit `.env` values or hardcoded secrets.
- Never bypass Supabase RLS by using the service role key on the client.
- Never use `default export` for React components.
- Never leave console.log statements in committed code.
