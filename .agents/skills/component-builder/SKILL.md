# SKILL: Component Builder

## Purpose

Build a complete, production-ready React component for Helix from scratch. This skill
combines the design system tokens, accessibility requirements, TypeScript rules, and
Helix-specific component patterns into a single repeatable process. Use it whenever
a new UI component is needed.

---

## When to Use This Skill

- Building any new component (primitive, domain, or layout)
- Extracting a repeated UI pattern into a reusable component
- Rebuilding an existing component that has grown inconsistent

---

## Required Reading Before Building

Always read these first — this skill does not repeat their contents:

- `.agents/rules/design-system.md` — colour tokens, typography, spacing, component anatomy
- `.agents/rules/code-style.md` — naming, TypeScript rules, forbidden patterns
- `.agents/rules/error-handling.md` — empty states, loading states, error states

---

## Step 1 — Classify and Place the File

| Type | Folder | Examples |
|------|--------|---------|
| Primitive | `src/components/ui/` | `Button`, `Badge`, `Avatar`, `Tooltip`, `Skeleton` |
| Ticket domain | `src/components/tickets/` | `TicketRow`, `TicketStatusBadge`, `TicketDetailHeader` |
| Escalation | `src/components/escalation/` | `EscalationModal`, `EscalationTargetSelect` |
| Dashboard | `src/components/dashboard/` | `MetricCard`, `AgentWorkloadChart`, `SLABreachCounter` |
| Layout | `src/components/layout/` | `AppShell`, `Sidebar`, `TopNav` |

File name: `kebab-case.tsx`. Export name: `PascalCase`. Never `default export`.

All interactive components must include `'use client'` as the very first line (before any comments or imports).

---

## Step 2 — Props Interface

Define props before writing any JSX. Rules:
- All props explicitly typed — no `any`
- Event handlers typed as plain functions: `onSelect: (id: string) => void`
- Optional props use `?` — do not default everything to optional
- If props exceed 8 fields, split the component

```ts
interface TicketRowProps {
  ticket: Ticket
  isSelected: boolean
  onSelect: (id: string) => void
  onOpen: (id: string) => void
}
```

---

## Step 3 — Component Templates

### Primitive — Badge

```tsx
'use client'

// src/components/ui/badge.tsx
import type { TicketStatus, TicketPriority } from '@/types'

interface BadgeProps {
  status?: TicketStatus
  priority?: TicketPriority
}

const statusStyles: Record<TicketStatus, string> = {
  open:      'bg-info/15 text-info',
  pending:   'bg-warning/15 text-warning',
  resolved:  'bg-success/15 text-success',
  escalated: 'bg-escalated/15 text-escalated',
}

const priorityStyles: Record<TicketPriority, string> = {
  urgent: 'bg-danger/15 text-danger',
  high:   'bg-warning/15 text-warning',
  medium: 'bg-info/15 text-info',
  low:    'bg-muted/15 text-muted',
}

export function Badge({ status, priority }: BadgeProps) {
  const label = status ?? priority ?? ''
  const styles = status
    ? statusStyles[status]
    : priority
    ? priorityStyles[priority]
    : ''

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-label font-medium uppercase tracking-wide ${styles}`}>
      {label}
    </span>
  )
}
```

---

### Domain — TicketRow

```tsx
'use client'

// src/components/tickets/ticket-row.tsx
import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatSLADue, isSLABreached, isSLAWarning } from '@/utils/sla'
import type { Ticket } from '@/types'

interface TicketRowProps {
  ticket: Ticket
  isSelected: boolean
  onSelect: (id: string) => void
  onOpen: (id: string) => void
}

export const TicketRow = memo(function TicketRow({ ticket, isSelected, onSelect, onOpen }: TicketRowProps) {
  const slaBreached = isSLABreached(ticket.sla_due)
  const slaWarning  = isSLAWarning(ticket.sla_due)

  return (
    <div
      role="row"
      aria-selected={isSelected}
      tabIndex={0}
      className={[
        'flex items-center gap-3 px-4 py-3 cursor-pointer border-l-[3px] transition-colors',
        'focus-visible:ring-2 focus-visible:ring-accent outline-none',
        isSelected
          ? 'bg-accent/8 border-l-accent'
          : 'bg-surface-raised border-l-transparent hover:bg-surface-overlay',
      ].join(' ')}
      onClick={() => onOpen(ticket.id)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(ticket.id)}
    >
      {/* Bulk select checkbox */}
      <input
        type="checkbox"
        aria-label={`Select ticket: ${ticket.title}`}
        checked={isSelected}
        onChange={() => onSelect(ticket.id)}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 accent-accent"
      />

      {/* Title + customer */}
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-text-primary truncate">{ticket.title}</p>
        <p className="text-body-sm text-text-secondary truncate">{ticket.customer?.name}</p>
      </div>

      {/* Status + priority */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge status={ticket.status} />
        <Badge priority={ticket.priority} />
      </div>

      {/* SLA due */}
      <span className={[
        'text-mono shrink-0',
        slaBreached ? 'text-danger' : slaWarning ? 'text-warning' : 'text-text-secondary',
      ].join(' ')}>
        {formatSLADue(ticket.sla_due)}
      </span>
    </div>
  )
})
```

---

### Modal — EscalationModal

```tsx
'use client'

// src/components/escalation/escalation-modal.tsx
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEscalateTicket } from '@/hooks/use-escalate-ticket'
import type { Ticket, User } from '@/types'

interface EscalationModalProps {
  ticket: Ticket
  agents: User[]
  onClose: () => void
}

export function EscalationModal({ ticket, agents, onClose }: EscalationModalProps) {
  const [toUserId, setToUserId] = useState('')
  const [reason, setReason]     = useState('')
  const [error, setError]       = useState<string | null>(null)
  const { escalate, isSubmitting } = useEscalateTicket()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleSubmit() {
    if (!toUserId) {
      setError('Please select a team or agent.')
      return
    }
    setError(null)
    try {
      await escalate(ticket.id, toUserId, reason)
      onClose()
    } catch (err) {
      setError('Failed to escalate. Please try again.')
      console.error('[EscalationModal]', err)
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="escalation-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-overlay rounded-lg w-full max-w-[480px] p-6 shadow-xl mx-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="escalation-title" className="text-page-heading font-semibold text-text-primary">
            Escalate Ticket
          </h2>
          <button onClick={onClose} aria-label="Close escalation modal"
            className="text-text-muted hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent rounded">
            <X size={20} />
          </button>
        </div>

        {/* Preloaded context — read only */}
        <div className="bg-surface-raised rounded px-3 py-2 mb-4">
          <p className="text-body-sm text-text-secondary">Ticket</p>
          <p className="text-body font-medium text-text-primary">{ticket.title}</p>
          <p className="text-body-sm text-text-secondary">{ticket.customer?.name}</p>
        </div>

        {/* Target selection */}
        <label htmlFor="escalation-target" className="block text-body-sm text-text-secondary mb-1">
          Escalate to <span aria-hidden>*</span>
        </label>
        <select
          id="escalation-target"
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          className="w-full bg-surface-raised border border-border rounded px-3 py-2 text-body text-text-primary mb-1"
        >
          <option value="">Select agent or team…</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        {error && <p role="alert" className="text-body-sm text-danger mb-3">{error}</p>}

        {/* Optional notes */}
        <label htmlFor="escalation-reason" className="block text-body-sm text-text-secondary mb-1 mt-3">
          Notes (optional)
        </label>
        <textarea
          id="escalation-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Add context for the receiving agent…"
          className="w-full bg-surface-raised border border-border rounded px-3 py-2 text-body text-text-primary resize-none"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!toUserId || isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Escalating…' : 'Escalate Ticket'}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

### Dashboard Widget — MetricCard

```tsx
'use client'

// src/components/dashboard/metric-card.tsx
import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  isLoading?: boolean
}

const trendIcons: Record<'up' | 'down' | 'neutral', LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

const trendColours: Record<'up' | 'down' | 'neutral', string> = {
  up: 'text-success',
  down: 'text-danger',
  neutral: 'text-text-muted',
}

export function MetricCard({ label, value, trend, trendLabel, isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="bg-surface-raised rounded-lg p-5 animate-pulse">
        <div className="h-3 w-24 bg-border rounded mb-3" />
        <div className="h-8 w-16 bg-border rounded" />
      </div>
    )
  }

  const TrendIcon = trend ? trendIcons[trend] : null
  const colour = trend ? trendColours[trend] : ''

  return (
    <div className="bg-surface-raised rounded-lg p-5">
      <p className="text-body-sm text-text-secondary mb-1">{label}</p>
      <p className="text-page-heading font-semibold text-text-primary">{value}</p>
      {trend && trendLabel && TrendIcon && (
        <div className={`flex items-center gap-1 mt-1 ${colour}`}>
          <TrendIcon size={14} aria-hidden />
          <span className="text-body-sm">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}
```

---

## Step 4 — Empty, Loading, and Error States

Every data-driven component must handle all three. Use this pattern:

```tsx
if (isLoading) return <SkeletonLoader rows={5} />
if (error)     return <ErrorState message="Could not load tickets." onRetry={refetch} />
if (!data.length) return (
  <EmptyState
    icon={<Inbox size={48} className="text-text-muted" />}
    heading="No tickets here"
    subtext="All caught up — new tickets will appear here."
  />
)
return <TicketList tickets={data} />
```

For data-fetching hooks, always include cleanup via `AbortController` or subscription teardown in the `useEffect` return to prevent state updates on unmounted components.

---

## Step 5 — Accessibility Checklist

Before the component is complete:

- [ ] All interactive elements reachable via `Tab` in logical order
- [ ] Focus ring: `focus-visible:ring-2 focus-visible:ring-accent` — never `outline-none` without replacement
- [ ] Icon-only buttons have `aria-label`
- [ ] Modals have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and close on `Escape`
- [ ] Form inputs have associated `<label>` with matching `htmlFor` / `id`
- [ ] Error messages use `role="alert"` for immediate announcement
- [ ] Colour is not the only differentiator — pair with text or icon
- [ ] Minimum touch target 44×44px on mobile
- [ ] Loading states announced via `aria-live="polite"` when content asynchronously updates

---

## Step 6 — Final Component Checklist

- [ ] File in correct folder (Step 1)
- [ ] `'use client'` directive present as first line if component uses hooks, event handlers, or browser APIs
- [ ] Named export only — no `default export`
- [ ] Props interface defined with explicit types
- [ ] Design tokens used — prefer token values; use arbitrary Tailwind values only when no token exists for the spec
- [ ] Empty, loading, and error states handled
- [ ] Accessibility checklist passed (Step 5)
- [ ] Mobile responsive — tested at < 768px
- [ ] Keyboard interaction works (Enter / Space on interactive elements, Escape on modals)
- [ ] API errors handled with user-facing messages — never swallowed silently
- [ ] Side effects cleaned up on unmount (event listeners, subscriptions, abort controllers)
- [ ] No `console.log` in the file
- [ ] No TypeScript `any` or unsuppressed `@ts-ignore`
- [ ] List items memoized with `React.memo` to prevent unnecessary re-renders

---

## Step 7 — Testing

After building the component, write tests co-located with the component:

- **Unit tests** for pure utilities: `utils/*.test.ts`
- **Integration tests** for interactive flows: `*.test.tsx`
- Cover at minimum: default render, user interaction, loading state, empty state, error state, keyboard navigation, and ARIA attribute presence

```tsx
// Example — MetricCard
import { render, screen } from '@testing-library/react'
import { MetricCard } from './metric-card'

it('renders metric value and label', () => {
  render(<MetricCard label="Open Tickets" value={42} />)
  expect(screen.getByText('Open Tickets')).toBeInTheDocument()
  expect(screen.getByText('42')).toBeInTheDocument()
})

it('shows skeleton when loading', () => {
  const { container } = render(<MetricCard label="Open Tickets" value={42} isLoading />)
  expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
})
```
