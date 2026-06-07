# SKILL: API Route Scaffolder

## Purpose

Scaffold a fully structured Supabase Edge Function (API route) for Helix. Each route
follows the project's security, validation, audit, and error-handling standards so no
critical step is missed when adding new backend functionality.

---

## When to Use This Skill

Use this skill whenever a new server-side endpoint is needed, including:

- Ticket mutations that require atomic operations (e.g. escalation ownership transfer)
- Actions that must bypass RLS temporarily (service-role, server-side only)
- Operations that need to trigger side effects (e.g. send notification, write audit log)
- Any logic that cannot be safely expressed as a direct Supabase client mutation

---

## Inputs Required Before Scaffolding

Before generating any code, confirm the following:

| Input | Example |
|-------|---------|
| Route name (kebab-case) | `escalate-ticket` |
| HTTP method | `POST` |
| Auth required? | Yes (always, unless explicitly stated otherwise) |
| Roles permitted | `agent`, `lead`, `admin` |
| Request body fields | `ticketId: uuid`, `toUserId: uuid`, `reason?: string` |
| DB tables touched | `ticket`, `escalation`, `ticket_activity` |
| Response shape | `{ success: true, escalationId: string }` |
| Is the operation atomic? | Yes → use a Postgres transaction |

---

## Before You Start

### Create the Edge Function

```bash
supabase functions new <route-name>
# Creates: supabase/functions/<route-name>/index.ts
```

### Set environment variables

```bash
# Local: use .env.local (supabase functions serve reads this)
# Production:
supabase secrets set SUPABASE_URL=<your-project-url>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-key>
supabase secrets set ALLOWED_ORIGIN=https://yourdomain.com
```

---

## Scaffold Steps

### 1. Prefer a Postgres RPC for atomic multi-table operations

For operations that touch multiple tables atomically, create a Postgres function and
call it via `supabase.rpc()`. This is simpler and more reliable than an Edge Function
for most cases.

```sql
-- supabase/migrations/<timestamp>_create_escalate_ticket_fn.sql
create or replace function escalate_ticket(
  p_ticket_id uuid,
  p_from_user uuid,
  p_to_user uuid,
  p_reason text default null
) returns uuid language plpgsql security definer as $$
declare
  v_escalation_id uuid;
begin
  insert into escalation (ticket_id, from_user, to_user, reason, status)
  values (p_ticket_id, p_from_user, p_to_user, p_reason, 'open')
  returning id into v_escalation_id;

  update ticket
  set assigned_to = p_to_user, status = 'escalated', updated_at = now()
  where id = p_ticket_id;

  return v_escalation_id;
end;
$$;
```

Then add the table to the Realtime publication if the result needs live updates.

### 2. Use an Edge Function when you need external side effects

Edge Functions are for operations that need HTTP calls, custom response logic, or
complex orchestration beyond a single RPC.

```ts
// supabase/functions/<route-name>/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// ── 1. Input schema ──────────────────────────────────────────────────────────
const RequestSchema = z.object({
  ticketId: z.string().uuid(),
  toUserId: z.string().uuid(),
  reason: z.string().max(1000).optional(),
})

// ── 2. CORS headers ──────────────────────────────────────────────────────────
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*'

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── 3. Handler ───────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 3a. Auth ─────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse(401, 'Missing authorization header')
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return errorResponse(401, 'Unauthorized')
    }

    // ── 3b. Role check ───────────────────────────────────────────────────────
    const { data: profile, error: profileError } = await userClient
      .from('user')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return errorResponse(403, 'Could not verify user role')
    }

    const allowedRoles = ['agent', 'lead', 'admin']
    if (!allowedRoles.includes(profile.role)) {
      return errorResponse(403, 'Insufficient permissions')
    }

    // ── 3c. Input validation ─────────────────────────────────────────────────
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      return errorResponse(400, 'Invalid request body', { fields: fieldErrors })
    }
    const { ticketId, toUserId, reason } = parsed.data

    // ── 3d. Business logic ───────────────────────────────────────────────────
    // Use service client for server-authoritative operations (bypasses RLS)
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Call the atomic Postgres RPC (see Step 1 for the SQL migration)
    const { data: escalationId, error: rpcError } = await serviceClient.rpc(
      'escalate_ticket',
      { p_ticket_id: ticketId, p_from_user: user.id, p_to_user: toUserId, p_reason: reason ?? null }
    )

    if (rpcError) throw rpcError

    // Audit log is written by DB trigger automatically — no manual insert needed

    // ── 3e. Success response ─────────────────────────────────────────────────
    return new Response(
      JSON.stringify({ success: true, escalationId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (err) {
    console.error('[escalate-ticket]', err)
    return errorResponse(500, 'Internal server error')
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function errorResponse(status: number, message: string, details?: unknown) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      ...(details ? { details } : {}),
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
  )
}
```

### 3. Test locally

```bash
# Serve the function with local env vars
supabase functions serve <route-name> --env-file .env.local

# In another terminal, test with curl:
curl -X POST http://localhost:54321/functions/v1/escalate-ticket \
  -H 'Authorization: Bearer <test-user-jwt>' \
  -H 'Content-Type: application/json' \
  -d '{"ticketId":"<uuid>","toUserId":"<uuid>","reason":"Escalating"}'
```

### 4. Deploy

```bash
supabase functions deploy <route-name>
```

### 5. Wire up the client call

Create a typed caller in `src/lib/api/<route-name>.ts`. Note: this file uses
`@/lib/supabase/client` (browser client) — only import it from `'use client'`
components or hooks, not Server Components.

```ts
// src/lib/api/escalate-ticket.ts
import { supabase } from '@/lib/supabase/client'

interface EscalateTicketInput {
  ticketId: string
  toUserId: string
  reason?: string
}

interface EscalateTicketResult {
  success: boolean
  escalationId: string
}

export async function escalateTicket(input: EscalateTicketInput): Promise<EscalateTicketResult> {
  const { data, error } = await supabase.functions.invoke('escalate-ticket', {
    body: input,
  })

  if (error) throw new Error(`[escalateTicket] ${error.message}`)
  return data as EscalateTicketResult
}
```

---

## Rate Limiting

Supabase Edge Functions do not have built-in rate limiting. For production:

- Add a simple in-memory rate limiter using Deno's `Map` with IP-based tracking.
- Or use a CDN-layer rate limit (e.g., Cloudflare, Netlify) in front of the function.
- Keep auth endpoint limits at Supabase's defaults (30 req/min for sign-in).

---

## Checklist — Every Route Must Have

- [ ] Zod schema for all request inputs
- [ ] Auth header check — reject missing/invalid tokens with 401
- [ ] Role check — reject unauthorised roles with 403
- [ ] Service role client used only inside the Edge Function, never exposed to client
- [ ] All DB errors caught and handled — never swallowed silently
- [ ] Consistent `errorResponse` helper used for all error paths
- [ ] Zod errors return only field-level info — never full schema internals
- [ ] CORS origin locked down via `ALLOWED_ORIGIN` env var in production
- [ ] Environment secrets set via `supabase secrets set`
- [ ] Typed client wrapper in `src/lib/api/`
- [ ] Function deployed and listed in `supabase/functions/` directory
- [ ] Rate limiting considered for production

---

## Security Reminders

- The `SUPABASE_SERVICE_ROLE_KEY` is only ever used server-side (Edge Function). Never reference it in `src/`.
- Always validate input with Zod before any DB operation.
- Always verify the calling user's session before using the service role client.
- Log errors with a `[function-name]` prefix — never log PII.
- Return generic error messages to the client; log specifics server-side.
