---
trigger: always_on
---

# Security Rules — Helix

## Security Philosophy

Helix handles customer support data — names, emails, ticket content, and internal agent
notes. This data must be protected at every layer. Security is not an afterthought; it is
enforced structurally so that no individual code path can accidentally expose data.

The **Supabase service role key is never exposed to the client — ever**. RLS is the
enforced access boundary. Auth is non-negotiable.

---

## Authentication

- **Supabase Auth** is the only authentication mechanism. No custom auth flows.
- Sessions use JWTs issued by Supabase. The `role` claim in the JWT determines access level.
- Session tokens are stored in `httpOnly` cookies (via Supabase SSR helpers) — never in
  `localStorage`. Cookies use `SameSite=Lax` to mitigate CSRF.
- Implement **middleware-level auth checks** on all protected routes using Next.js middleware
  + Supabase server client.
- In middleware, prefer `supabase.auth.getUser()` over `getSession()` — it always verifies
  the token against the auth server and is more reliable for server-side enforcement.
- Redirect unauthenticated users to `/login` — no protected page should ever render without
  a valid session.

```ts
// middleware.ts — enforce auth on all routes except /login
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient({ req: request, res: NextResponse.next() })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return response
}
```

---

## Row Level Security (RLS)

- **RLS must be enabled on every table** — no exceptions.
- RLS is the authoritative access layer; frontend guards are secondary defence only.
- Policies are based on the authenticated user's `id` and `role` from `auth.users`.
- RLS also applies to **Supabase Realtime subscriptions** — never create a public channel
  that bypasses row-level access checks. The same policies that govern `SELECT` queries
  also govern Realtime broadcasts.

### Required Policies Per Table

| Table | Agent | Lead | Admin |
|-------|-------|------|-------|
| `ticket` | SELECT assigned or open tickets; UPDATE assigned tickets | SELECT all; UPDATE all | Full access |
| `message` | SELECT/INSERT on assigned tickets | SELECT all | Full access |
| `customer` | SELECT on tickets they handle | SELECT all | Full access |
| `escalation` | INSERT (outbound); SELECT own | SELECT all | Full access |
| `ticket_activity` | SELECT only (read audit log) | SELECT all | Full access |
| `user` | SELECT own profile | SELECT team | Full access |

### RLS Policy Pattern

```sql
-- Agents can only update tickets assigned to them
create policy "Agents update own tickets"
on ticket for update
using (
  auth.uid() = assigned_to
  or exists (
    select 1 from "user"
    where id = auth.uid() and role in ('lead', 'admin')
  )
);
```

---

## API Keys and Secrets

### Supabase Keys

| Key | Where it lives | Accessible to client? |
|-----|---------------|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` → public | ✅ Yes — public by design (project URL only) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` → public | ✅ Yes — public by design (RLS enforces data access) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` → server only | ❌ Never — bypasses RLS entirely |

Both the anon key and project URL are **designed to be public** by Supabase — the anon key
is safe to expose because RLS policies enforce what data each user can see.

- The service role key is **only** used in Supabase Edge Functions or server-side scripts
  (migrations, seeding).
- Never import `SUPABASE_SERVICE_ROLE_KEY` in any file under `src/` that runs client-side.

### Environment Variables

- All secrets live in `.env.local` (gitignored).
- `.env.example` lists required keys with empty values — commit this file.
- CI/CD uses environment secrets — never hardcode values in source.
- The agent must never output or log actual secret values.

```
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server/Edge Functions only
```

---

## Input Validation and Sanitisation

- **Never trust client input.** Validate all inputs on the server (Edge Function or RLS check)
  before persisting.
- Use **Zod** for runtime schema validation on all API inputs and form submissions.
- React's default JSX escaping handles output sanitisation — never bypass it with
  `dangerouslySetInnerHTML`.
- Ticket content and messages are plain text or Markdown — strip and reject HTML input at
  the schema validation layer.
- Return **generic error messages** to the client (e.g., "Validation failed") — never leak
  implementation details. Log the specifics server-side.

```ts
// ✅ Validate with Zod before mutation
const EscalationSchema = z.object({
  ticketId: z.string().uuid(),
  toUserId: z.string().uuid(),
  reason: z.string().max(1000).optional(),
})

const parsed = EscalationSchema.safeParse(input)
if (!parsed.success) {
  console.error('[Escalation] Invalid payload', parsed.error.flatten())
  throw new Error('Invalid escalation payload')
}
```

---

## Role-Based Access Control (RBAC)

Three roles: `agent`, `lead`, `admin`. Stored in the `user.role` column and mirrored in
the JWT custom claim.

| Feature | Agent | Lead | Admin |
|---------|-------|------|-------|
| View own assigned tickets | ✅ | ✅ | ✅ |
| View all tickets | ❌ | ✅ | ✅ |
| Update ticket status | ✅ (own) | ✅ (all) | ✅ |
| Escalate ticket | ✅ | ✅ | ✅ |
| View manager dashboard | ❌ | ✅ | ✅ |
| Manage users / roles | ❌ | ❌ | ✅ |
| View audit log | ✅ (own) | ✅ (team) | ✅ |

- Role checks in the UI control **visibility** (e.g. hide Dashboard nav for agents).
- Role checks in RLS control **data access** — the true enforcement layer.
- Never use `role` from client-side state alone to gate data — always let RLS enforce.

---

## Audit Trail

- All ticket mutations are recorded in `ticket_activity` via Postgres triggers — this cannot
  be disabled from application code.
- The audit log records: `ticket_id`, `actor_id`, `action`, `previous_value`, `new_value`,
  `timestamp`.
- The audit log is **append-only** — no UPDATE or DELETE policies on `ticket_activity`.
- Escalation events are additionally recorded in the `escalation` table with full context
  preserved.

---

## Data Privacy (GDPR Baseline)

- Customer PII (name, email, metadata) is stored in the `customer` table and never duplicated
  into logs or analytics.
- Do not log PII to the console or any external service.
- Configure Supabase project with **EU data residency** if customers are EU-based.
- On customer deletion requests: provide a mechanism for admins to anonymise the `customer`
  record (replace name/email with `[deleted]`) — do not hard-delete to preserve ticket
  history integrity.
- Do not send customer data to third-party analytics tools without explicit consent.

---

## Transport Security

- All traffic is over **HTTPS** — Supabase enforces this; ensure deployment platform does too.
- WebSocket connections (`wss://`) only — no unencrypted `ws://`.
- Set security headers in `next.config.ts`:

```ts
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'NOSNIFF' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; font-src 'self'; base-uri 'self'; form-action 'self'" },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---

## Rate Limiting & Abuse Prevention

- Supabase provides built-in rate limiting on auth endpoints (30 req/min per IP for
  sign-in, 5 req/min for sign-up). Do not disable or raise these limits.
- For custom Edge Functions, implement rate limiting via Supabase's built-in rate
  limiter or a middleware check against `x-forwarded-for`.
- Add a CAPTCHA (e.g., Turnstile or reCAPTCHA) to the `/login` page to prevent automated
  brute force attempts.

---

## Edge Function Security

- Edge Functions use `SUPABASE_SERVICE_ROLE_KEY` by default — they bypass RLS.
- **Always verify the caller's JWT** inside every Edge Function that handles user-scoped
  requests:

```ts
// Inside a Supabase Edge Function
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
  global: { headers: { Authorization: req.headers.get('Authorization')! } },
})
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) return new Response('Unauthorized', { status: 401 })
```

- Never use the service role client for user-scoped operations. Create an anon-key client
  with the caller's `Authorization` header for any operation that should respect RLS.
- Never construct SQL strings by concatenating user input — use parameterized queries or
  the Supabase SDK. Raw SQL in Edge Functions is a SQL injection risk.

---

## Destructive Action Guards

All irreversible actions require an explicit confirmation step before execution:

| Action | Guard |
|--------|-------|
| Close ticket | Confirmation dialog: "Close this ticket? This will mark it as resolved." |
| Escalate ticket | Modal with required target selection — submit disabled until complete |
| Bulk status change | Confirmation with count: "Update 12 tickets to Resolved?" |
| Delete user (Admin) | Confirmation + reason field |

Never auto-confirm destructive actions on keyboard shortcut — require a separate confirm
keystroke or button click.

---

## Dependency Security

- Run `npm audit` in CI — fail on high/critical vulnerabilities.
- Keep Supabase client and Next.js on latest stable releases.
- Do not install packages that require the service role key to be exposed client-side.
- Review `package.json` on every dependency addition — no unused packages.

---

## What the Agent Must Never Do

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code or logs.
- Never disable RLS on any table.
- Never use `dangerouslySetInnerHTML` with user-generated content.
- Never store session tokens in `localStorage`.
- Never skip Zod validation before a Supabase mutation in an Edge Function.
- Never log PII (names, emails, ticket content) to console or external services.
- Never allow a destructive action without a confirmation step.
- Never hardcode secrets, API keys, or credentials in source code.
- Never construct raw SQL by concatenating user input.
