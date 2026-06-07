---
trigger: always_on
---

# Realtime Rules — Helix

## Overview

Supabase Realtime is the backbone of Helix's live ticket updates. Every screen that
displays ticket data must reflect changes within 2–3 seconds without a page refresh.
Getting this wrong causes memory leaks, stale UI, duplicate subscriptions, and silent
data loss. Follow these rules exactly.

---

## Table Configuration

Realtime must be enabled per table. Without this step, subscriptions receive no events.

```sql
-- Run this migration for every new table that needs Realtime
alter publication supabase_realtime add table ticket;
alter publication supabase_realtime add table message;
alter publication supabase_realtime add table escalation;

-- For existing publications, run once:
-- (this is already configured for the core schema migrations)
```

To verify which tables are in the publication:
```sql
select * from pg_publication_tables where pubname = 'supabase_realtime';
```

Add this step to every migration that creates a table with Realtime requirements.

---

## Channel Architecture

One channel per screen scope. Never one global channel for the whole app.

| Screen | Channel name | Listens to | Filter |
|--------|-------------|------------|--------|
| Ticket Inbox | `tickets:inbox` | All ticket INSERT / UPDATE / DELETE | None (role-based visibility via RLS) |
| Ticket Detail | `ticket:{id}` | Single ticket UPDATE + message INSERT | `id=eq.{ticketId}` for ticket table |
| Manager Dashboard | `dashboard:metrics` | Ticket status changes for aggregation | None |
| Escalation (active) | `escalations:active` | Escalation INSERT / UPDATE | None |

Never subscribe to a channel the current user's role cannot access — check role before subscribing.

For each channel, the filter should be as narrow as possible to minimise network traffic
and processing overhead.

---

## Subscription Pattern

Always follow this exact structure. No variations.

```ts
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

interface TicketRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Ticket
  old: Partial<Ticket>
}

function useTicketInboxRealtime(onUpdate: (payload: TicketRealtimePayload) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('tickets:inbox')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ticket' },
        (payload) => onUpdate(payload as TicketRealtimePayload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.info('[Realtime] tickets:inbox connected')
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] tickets:inbox connection error')
        }
      })

    // ── ALWAYS return cleanup ──────────────────────────────────────────────
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])  // Empty deps — subscribe once on mount, clean up on unmount
}
```

**The cleanup return is non-negotiable.** Missing it leaks the channel on every remount.

### Dependency strategy for dynamic channels

For channels that depend on dynamic values (e.g., `ticket:{id}`), include the identifier
in the dependency array so the channel is recreated when the value changes:

```ts
function useTicketDetailRealtime(ticketId: string) {
  useEffect(() => {
    const channel = supabase
      .channel(`ticket:${ticketId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ticket', filter: `id=eq.${ticketId}` },
        handleTicketUpdate
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message', filter: `ticket_id=eq.${ticketId}` },
        handleMessageInsert
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [ticketId])  // Re-subscribe when navigating between tickets
}
```

---

## Event Handling

Handle INSERT, UPDATE, and DELETE explicitly. Never assume which event fires.

```ts
.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket' }, handleInsert)
.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ticket' }, handleUpdate)
.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ticket' }, handleDelete)
```

### Payload shape

```ts
interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T        // populated on INSERT and UPDATE
  old: Partial<T>  // populated on UPDATE and DELETE (only PK fields on DELETE)
  schema: string
  table: string
}
```

On UPDATE: merge `payload.new` into existing state — never replace the full list.
On DELETE: remove the item by `id` from state.
On INSERT: prepend to list only if it matches current filters — do not blindly append.

### Deduplication

Realtime may deliver the same event twice (at-least-once delivery). Track processed
event IDs to prevent double-applying:

```ts
const processedEvents = useRef<Set<string>>(new Set())

function handleEvent(payload: RealtimePayload<Ticket>) {
  // Use a combination of primary key + updated_at as a dedup key
  const dedupKey = `${payload.new.id}-${payload.new.updated_at}`
  if (processedEvents.current.has(dedupKey)) return
  processedEvents.current.add(dedupKey)

  // Apply the event...
}
```

### Rate limiting rapid events

Bulk operations can produce multiple events in quick succession. Batch state updates:

```ts
// Debounce the store update — batch events within a 100ms window
function debouncedApply(updates: Ticket[]) {
  clearTimeout(batchTimer)
  batchTimer = setTimeout(() => {
    useTicketStore.getState().mergeTickets(updates)
  }, 100)
}
```

---

## Conflict Resolution

When a Realtime event arrives for a record that was also mutated optimistically:

1. Compare `payload.new.updated_at` against the local optimistic timestamp.
2. If server `updated_at` is newer → accept server state, discard optimistic.
3. If local timestamp is newer → server event is stale; keep local state and wait for the next event.
4. Always show a non-blocking indicator: `"Updated just now"` — never a blocking dialog.

```ts
function reconcileTicket(local: Ticket, serverPayload: Ticket): Ticket {
  const serverTime = new Date(serverPayload.updated_at).getTime()
  const localTime  = new Date(local.updated_at).getTime()
  return serverTime >= localTime ? serverPayload : local
}
```

---

## Disconnect Handling

WebSocket disconnects must never silently fail or leave the UI stale.

```ts
function useRealtimeStatus(channel: RealtimeChannel) {
  const [status, setStatus] = useState<RealtimeStatus>('connecting')
  const wasDisconnected = useRef(false)

  channel.subscribe((subStatus) => {
    if (subStatus === 'SUBSCRIBED') {
      if (wasDisconnected.current) {
        wasDisconnected.current = false
        // Re-fetch current data to fill the gap
        refetchCurrentData()
      }
      setStatus('connected')
    }
    if (subStatus === 'CHANNEL_ERROR') {
      wasDisconnected.current = true
      setStatus('error')
    }
    if (subStatus === 'TIMED_OUT') {
      wasDisconnected.current = true
      setStatus('reconnecting')
    }
    if (subStatus === 'CLOSED') {
      wasDisconnected.current = true
      setStatus('disconnected')
    }
  })

  return status
}
```

### Disconnect behaviour by screen

| Screen | On disconnect |
|--------|--------------|
| Ticket Inbox | Show `"Live updates paused — reconnecting..."` banner; data stays visible (read-only) |
| Ticket Detail | Show inline indicator on conversation thread; queued replies will retry via the message retry queue on reconnect |
| Manager Dashboard | Show stale timestamp: `"Last updated 2 min ago"` |

On reconnect: re-fetch the current data snapshot before resuming live events to fill
the gap. Queued mutations from the retry queue are not auto-replayed — the user
triggers them manually via the retry button.

---

## Session Expiry & Realtime

When a user's session expires, the Realtime subscription will fail with `CHANNEL_ERROR`.
Handle this via the global auth state listener:

```ts
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    // Remove all active Realtime channels
    supabase.getChannels().forEach(c => supabase.removeChannel(c))
    router.push('/login?expired=true')
  }
})
```

This prevents stale subscriptions from lingering after logout.

---

## Internal Notes & Role Visibility

Messages with `is_internal = true` should only be delivered to agents via Realtime,
not to customer-facing contexts. Since RLS policies on the `message` table enforce
this, Realtime subscriptions automatically respect the same rules — no additional
filtering is needed as long as RLS is configured correctly.

To verify: the Realtime channel uses the same JWT as the REST API, so RLS policies
apply equally. If a user cannot SELECT a row directly, they won't receive it via
Realtime either.

---

## Testing Realtime

```ts
import { describe, it, vi, expect } from 'vitest'
import { RealtimeChannel } from '@supabase/supabase-js'

// Mock the Supabase client channel
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockImplementation((cb) => cb('SUBSCRIBED')),
} as unknown as RealtimeChannel

vi.mock('@/lib/supabase/client', () => ({
  supabase: { channel: vi.fn(() => mockChannel), removeChannel: vi.fn() },
}))

it('subscribes to ticket inbox channel on mount', () => {
  renderHook(() => useTicketInboxRealtime(vi.fn()))
  expect(mockChannel.on).toHaveBeenCalledWith('postgres_changes', expect.any(Object), expect.any(Function))
  expect(mockChannel.subscribe).toHaveBeenCalled()
})
```

Test at least: subscription on mount, cleanup on unmount, event handler called on
payload, status changes handled.

---

## Presence (Future — Do Not Build in MVP)

Supabase Realtime Presence (tracking which agents are viewing a ticket) is out of scope
for v1. Do not subscribe to Presence channels in the MVP — reserve channel naming
`presence:{ticketId}` for v2.

---

## What the Agent Must Never Do

- Never subscribe to a channel without a cleanup `return () => supabase.removeChannel(channel)`.
- Never create a global single channel for the entire app.
- Never blindly replace full list state on a Realtime UPDATE — always merge by `id`.
- Never ignore `CHANNEL_ERROR` or `TIMED_OUT` status — always surface to the UI.
- Never skip the snapshot re-fetch after a reconnect.
- Never subscribe to tables the user's role cannot access via RLS.
- Never forget to add the table to the `supabase_realtime` publication in the migration.
