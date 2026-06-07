---
trigger: always_on
---

# Error Handling Rules — Helix

## Overview

Helix has specific, PRD-defined failure modes that must be handled consistently.
Agents operate under pressure — an unhandled error or silent failure during ticket
resolution costs them time and trust. Every failure surface has a required behaviour.
Follow it exactly.

---

## Failure Surface Map

| Surface | Failure | Required Behaviour |
|---------|---------|-------------------|
| Ticket status update | Mutation fails | Rollback optimistic state → error toast |
| Message send | Send fails | Retry queue → inline "Failed to send" with retry button |
| Escalation submit | Transfer fails | Rollback ownership → keep modal open → inline error |
| Ticket inbox | API fetch fails | Retry state with "Reload" button — not blank screen |
| Real-time sync | WebSocket disconnect | Read-only fallback + reconnecting banner |
| Real-time sync | Conflict on update | Last-write-wins + `"Updated just now"` indicator |
| Escalation | Duplicate submission | Prevent second submit — disable button on first click |
| Escalation | Missing target team | Inline validation error — block submit |
| Dashboard | Partial data load | Skeleton loaders — never partial/broken cards |
| Dashboard | Stale metrics | `"Last updated X min ago"` timestamp |
| Bulk action | Partial failure | Show count: `"8 of 10 tickets updated"` + retry failed |
| Auth | Session expired | Redirect to `/login` — do not show a generic error |
| Offline | No network | Read-only mode — disable all mutations, show offline banner |

---

## Optimistic Update + Rollback Pattern

All ticket mutations use optimistic updates. This is the required pattern — no variations.

```ts
async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  // 1. Snapshot current state for rollback
  const previous = useTicketStore.getState().getTicket(ticketId)

  // 2. Apply optimistic update immediately
  useTicketStore.getState().updateTicket(ticketId, { status })

  try {
    // 3. Persist to Supabase
    const { error } = await supabase
      .from('ticket')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId)

    if (error) throw error

  } catch (err) {
    // 4. Rollback to snapshot on failure
    useTicketStore.getState().updateTicket(ticketId, previous)
    toast.error('Failed to update ticket. Please try again.')
    console.error('[updateTicketStatus]', err)
  }
}
```

**Rules:**
- Always snapshot before mutating.
- Always roll back to the snapshot — never to a hardcoded fallback value.
- Always show a toast on failure — never fail silently.
- Never disable the action permanently after a failure — allow retry.

---

## Message Send — Retry Queue

Failed message sends go into a retry queue. Never just show an error and discard the message.

```ts
interface QueuedMessage {
  id: string          // temp local id
  ticketId: string
  content: string
  status: 'sending' | 'failed' | 'sent'
  retries: number
}
```

UI behaviour:
- While sending: show message with a spinner, disabled retry button.
- On failure: show message with red `"Failed to send"` label + `"Retry"` button.
- On retry: re-attempt send, increment `retries`.
- After 3 failed retries: show `"Unable to send. Check your connection."` — stop auto-retry.
- On success: replace temp id with server id, remove failed indicator.

---

## Escalation — Specific Error Rules

The escalation flow has the most complex error requirements in the PRD.

```
Escalation failure  → rollback ticket ownership + status → keep modal open → show inline error
Duplicate submit    → disabled submit button from first click until response or timeout
Missing target      → inline validation: "Please select a team or agent" — block submit
```

```ts
async function submitEscalation(payload: EscalationPayload) {
  setSubmitting(true)   // disables button — prevents duplicate submission

  const previousTicket = getTicket(payload.ticketId)

  // Optimistic: update ticket ownership in UI
  optimisticEscalate(payload.ticketId, payload.toUserId)

  try {
    await escalateTicket(payload)
    toast.success('Ticket escalated')
    closeModal()
  } catch (err) {
    // Rollback ticket to previous owner and status
    rollbackTicket(payload.ticketId, previousTicket)
    setModalError('Escalation failed. Please try again.')  // inline — modal stays open
    console.error('[EscalationModal]', err)
  } finally {
    setSubmitting(false)
  }
}
```

---

## Toast Notifications

All user-facing errors and successes use toasts. Toast rules:

| Type | When | Duration |
|------|------|---------|
| `toast.success` | Mutation confirmed by server | 3s auto-dismiss |
| `toast.error` | Mutation failed, user action needed | 6s, manually dismissible |
| `toast.warning` | Non-blocking issue (e.g. stale data) | 4s auto-dismiss |

```ts
// ✅ Always use the toast utility — never alert() or console-only errors
toast.success('Ticket resolved')
toast.error('Failed to send reply. Please try again.')
toast.warning('Your session will expire in 5 minutes.')

// ❌ Never do this
alert('Error!')
console.error('something broke')  // in UI code without a toast
```

---

## Empty and Error States

Every data surface must have both states. Never leave either as a blank screen.

```tsx
// ✅ Required pattern for any data-fetching component
if (isLoading) return <SkeletonLoader />
if (error)     return <ErrorState message="Could not load tickets." onRetry={refetch} />
if (!data.length) return <EmptyState message="No tickets available." />
return <TicketList tickets={data} />
```

`ErrorState` component must always include:
- A clear non-technical message ("Could not load tickets")
- A "Try again" / "Reload" button that calls the refetch function
- Never the raw error message or stack trace

---

## Auth Errors

| Scenario | Behaviour |
|----------|----------|
| No session on page load | Redirect to `/login` via middleware — no flash of content |
| Session expires mid-session | Intercept 401 from Supabase → redirect to `/login` with `?expired=true` |
| Insufficient role (403) | Show `"You don't have permission to do this"` toast — do not redirect |

```ts
// Supabase client — intercept auth errors globally
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    if (event === 'SIGNED_OUT') router.push('/login?expired=true')
  }
})
```

---

## Logging Convention

```ts
// Format: [ModuleName] message
console.error('[useTicketInbox] Failed to fetch tickets:', err)
console.error('[EscalationModal] Escalation failed:', err)
console.info('[Realtime] tickets:inbox connected')

// ❌ Never log PII
console.error('Customer email:', customer.email)   // FORBIDDEN
console.error('Ticket content:', ticket.description)  // FORBIDDEN
```

Log the module, log the error object — never log ticket content, customer data, or user details.

---

## What the Agent Must Never Do

- Never swallow errors silently with an empty `catch` block.
- Never show raw error messages, stack traces, or Supabase error codes to the user.
- Never leave a mutation's failed state without a visible retry path.
- Never discard a failed message — always queue for retry.
- Never keep the escalation modal open after success or close it after failure.
- Never use `alert()` for any error — always use the toast system.
- Never log PII in error messages.