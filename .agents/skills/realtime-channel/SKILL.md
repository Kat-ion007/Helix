# SKILL: Realtime Channel

## Purpose

Set up, manage, and tear down a Supabase Realtime channel correctly for a given
Helix screen. Use this skill whenever a screen needs live ticket updates. Wrong
teardown causes memory leaks; wrong event handling causes stale or duplicated UI.

---

## When to Use This Skill

- Adding live updates to any screen (Inbox, Ticket Detail, Dashboard)
- A new table needs to broadcast changes to the UI in real time
- Debugging a channel that is not updating or is causing memory leaks

---

## Before You Start

Ensure the table is added to the Realtime publication. Without this, subscriptions
silently receive no events:

```sql
alter publication supabase_realtime add table ticket;
alter publication supabase_realtime add table message;
-- Run for every new table that needs Realtime
```

Verify: `select * from pg_publication_tables where pubname = 'supabase_realtime';`

---

## Inputs Required

| Input | Example |
|-------|---------|
| Screen name | `TicketInbox` |
| Channel name | `tickets:inbox` |
| Table to watch | `ticket` |
| Events needed | `INSERT`, `UPDATE`, `DELETE` (or `*`) |
| Filter (optional) | `assigned_to=eq.{userId}` |
| State update function | `useTicketStore.getState().upsertTicket` |

---

## Realtime Status Store

Tracks connection status per channel so the banner can react. Also tracks
`wasDisconnected` per channel for reconnect refetch.

```ts
// src/store/realtime-store.ts
import { create } from 'zustand'

export type ChannelConnectionStatus = 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED'

interface RealtimeState {
  statuses: Record<string, ChannelConnectionStatus>
  wasDisconnected: Record<string, boolean>
  setChannelStatus: (channel: string, status: ChannelConnectionStatus) => void
  markDisconnected: (channel: string) => void
  clearDisconnected: (channel: string) => void
  getChannelStatus: (channel: string) => ChannelConnectionStatus | undefined
}

export const useRealtimeStatus = create<RealtimeState>((set, get) => ({
  statuses: {},
  wasDisconnected: {},
  setChannelStatus: (channel, status) =>
    set((s) => ({ statuses: { ...s.statuses, [channel]: status } })),
  markDisconnected: (channel) =>
    set((s) => ({ wasDisconnected: { ...s.wasDisconnected, [channel]: true } })),
  clearDisconnected: (channel) =>
    set((s) => ({ wasDisconnected: { ...s.wasDisconnected, [channel]: false } })),
  getChannelStatus: (channel) => get().statuses[channel],
}))
```

For large inboxes, use a `Map<string, Ticket>` inside the Zustand store instead of
arrays with `findIndex` — O(1) lookups by `id` are significantly faster.

---

## Deduplication

Supabase Realtime can deliver the same event twice (at-least-once). Track processed
events to prevent double-applying:

```ts
const processed = useRef<Set<string>>(new Set())

function isDuplicate(id: string, updatedAt: string): boolean {
  const key = `${id}-${updatedAt}`
  if (processed.current.has(key)) return true
  processed.current.add(key)
  return false
}
```

Apply this guard inside every event handler before mutating state.

---

## Channel Templates

### Template 1 — Ticket Inbox (all tickets, no filter)

```ts
// src/lib/realtime/use-inbox-realtime.ts
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTicketStore } from '@/store/ticket-store'
import { useRealtimeStatus } from '@/store/realtime-store'
import type { Ticket } from '@/types'

const CHANNEL_NAME = 'tickets:inbox'
const processed = new Set<string>()

export function useInboxRealtime() {
  const { upsertTicket, removeTicket, refetch } = useTicketStore()
  const { setChannelStatus, markDisconnected, clearDisconnected } = useRealtimeStatus()

  useEffect(() => {
    const channel = supabase
      .channel(CHANNEL_NAME)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket' },
        ({ new: ticket }) => {
          const t = ticket as Ticket
          if (isDuplicate(t.id, t.updated_at)) return
          upsertTicket(t)
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ticket' },
        ({ new: ticket }) => {
          const t = ticket as Ticket
          if (isDuplicate(t.id, t.updated_at)) return
          upsertTicket(t)
        })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ticket' },
        ({ old }) => removeTicket((old as Partial<Ticket>).id!))
      .subscribe(async (status) => {
        setChannelStatus(CHANNEL_NAME, status)

        if (status === 'SUBSCRIBED' && useRealtimeStatus.getState().wasDisconnected[CHANNEL_NAME]) {
          await refetch()
          clearDisconnected(CHANNEL_NAME)
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          markDisconnected(CHANNEL_NAME)
          console.error('[Realtime] tickets:inbox —', status)
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [])
}
```

---

### Template 2 — Ticket Detail (single ticket + its messages)

```ts
// src/lib/realtime/use-ticket-detail-realtime.ts
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTicketStore } from '@/store/ticket-store'
import { useMessageStore } from '@/store/message-store'
import { useRealtimeStatus } from '@/store/realtime-store'
import type { Ticket, Message } from '@/types'

const processed = new Set<string>()

export function useTicketDetailRealtime(ticketId: string) {
  const { upsertTicket, refetchTicket } = useTicketStore()
  const { appendMessage, updateMessage, removeMessage, refetchMessages } = useMessageStore()
  const { setChannelStatus, markDisconnected, clearDisconnected } = useRealtimeStatus()

  const ticketChannel = `ticket:${ticketId}`
  const messageChannel = `message:${ticketId}`

  useEffect(() => {
    if (!ticketId) return

    const channel = supabase
      .channel(ticketChannel)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ticket', filter: `id=eq.${ticketId}` },
        ({ new: ticket }) => {
          const t = ticket as Ticket
          if (isDuplicate(t.id, t.updated_at)) return
          upsertTicket(t)
        })
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message', filter: `ticket_id=eq.${ticketId}` },
        ({ new: msg }) => {
          const m = msg as Message
          if (isDuplicate(m.id, m.created_at)) return
          appendMessage(m)
        })
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'message', filter: `ticket_id=eq.${ticketId}` },
        ({ new: msg }) => updateMessage(msg as Message))
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'message', filter: `ticket_id=eq.${ticketId}` },
        ({ old }) => removeMessage((old as Partial<Message>).id!))
      .subscribe(async (status) => {
        setChannelStatus(ticketChannel, status)

        if (status === 'SUBSCRIBED' && useRealtimeStatus.getState().wasDisconnected[ticketChannel]) {
          await refetchTicket(ticketId)
          await refetchMessages(ticketId)
          clearDisconnected(ticketChannel)
        }
        if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
          markDisconnected(ticketChannel)
          console.error(`[Realtime] ${ticketChannel} —`, status)
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [ticketId])
}
```

---

### Template 3 — Manager Dashboard (aggregated metrics)

Dashboard metrics are computed server-side (DB view or scheduled refresh). Realtime is
used only to trigger a re-fetch — SLA breach is not computed client-side.

```ts
// src/lib/realtime/use-dashboard-realtime.ts
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useDashboardStore } from '@/store/dashboard-store'

export function useDashboardRealtime() {
  const { refreshMetrics } = useDashboardStore()

  useEffect(() => {
    const channel = supabase
      .channel('dashboard:metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket' }, () => {
        // Debounce: batch rapid changes into a single re-fetch
        refreshMetrics()
      })
      .subscribe((status) => {
        if (['CHANNEL_ERROR', 'TIMED_OUT'].includes(status)) {
          console.error('[Realtime] dashboard:metrics —', status)
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [])
}
```

For rapid bulk operations, debounce the store update:

```ts
let batchTimer: ReturnType<typeof setTimeout>

function debouncedRefresh() {
  clearTimeout(batchTimer)
  batchTimer = setTimeout(() => refreshMetrics(), 200)
}
```

---

## Disconnect Banner Component

Shows on any screen that uses a Realtime channel. Listens to all channel statuses.

```tsx
// src/components/ui/realtime-status-banner.tsx
import { useRealtimeStatus } from '@/store/realtime-status'

export function RealtimeStatusBanner() {
  const statuses = useRealtimeStatus((s) => s.statuses)
  const hasIssue = Object.values(statuses).some(
    (s) => s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' || s === 'CLOSED'
  )

  if (!hasIssue) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-warning/15 text-warning text-body-sm text-center py-2 px-4 transition-opacity duration-normal"
    >
      Live updates paused — reconnecting...
    </div>
  )
}
```

---

## Upsert Pattern for Zustand

Use `upsertTicket` (update if exists, insert if new) — never blindly append.

```ts
// Inside ticket-store.ts
upsertTicket: (incoming: Ticket) => set((state) => {
  const existing = state.tickets.findIndex(t => t.id === incoming.id)
  if (existing === -1) {
    // New ticket — prepend if it matches active filters, otherwise skip
    return { tickets: [incoming, ...state.tickets] }
  }
  // Existing ticket — reconcile by updated_at
  const current = state.tickets[existing]
  const serverIsNewer =
    new Date(incoming.updated_at) >= new Date(current.updated_at)
  if (!serverIsNewer) return state  // local optimistic state is newer, keep it
  const updated = [...state.tickets]
  updated[existing] = incoming
  return { tickets: updated }
})
```

For large inboxes (500+ tickets), replace the array with a `Map<string, Ticket>` for
O(1) lookups and updates.

---

## Testing Realtime Hooks

```ts
import { describe, it, vi, expect } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockImplementation((cb) => cb('SUBSCRIBED')),
}

vi.mock('@/lib/supabase/client', () => ({
  supabase: { channel: vi.fn(() => mockChannel), removeChannel: vi.fn() },
}))

it('subscribes to inbox channel on mount', () => {
  renderHook(() => useInboxRealtime())
  expect(mockChannel.on).toHaveBeenCalled()
  expect(mockChannel.subscribe).toHaveBeenCalled()
})

it('cleans up channel on unmount', () => {
  const { unmount } = renderHook(() => useInboxRealtime())
  unmount()
  expect(mockRemoveChannel).toHaveBeenCalled()
})
```

Test at minimum: subscription on mount, cleanup on unmount, event handler called,
status changes trigger the correct store actions.

---

## Checklist — Every New Channel

- [ ] Table added to `supabase_realtime` publication via migration
- [ ] Channel name follows convention: `table:scope` (e.g. `ticket:inbox`, `ticket:{id}`)
- [ ] `useEffect` cleanup returns `supabase.removeChannel(channel)`
- [ ] All three events handled (INSERT / UPDATE / DELETE) or explicitly scoped to needed events
- [ ] Deduplication guard applied to event handlers
- [ ] `wasDisconnected` tracking + snapshot re-fetch on reconnect
- [ ] Status reported to `useRealtimeStatus` → consumed by `RealtimeStatusBanner`
- [ ] Upsert uses `updated_at` reconciliation — not blind replacement
- [ ] Role check performed before subscribing — no channels for inaccessible tables
- [ ] Tests written for the hook
