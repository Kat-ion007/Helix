---
trigger: always_on
---

# Design System Rules — Helix

## Design Philosophy

Helix is an **agent-first workspace**, not a marketing site. Every visual decision must
serve speed and clarity. Reduce cognitive load at every turn. Agents under pressure should
never have to search for an action, decode a colour, or re-read a label.

> Dense but not cluttered. Fast but not spartan. Clear before beautiful.

---

## Colour Palette

CSS variables use `--color-*` naming. Tailwind classes drop the prefix: `--color-surface`
maps to `bg-surface`, `text-surface`, `border-surface`, etc. Configured in
`tailwind.config.ts` under `theme.extend.colors`.

### Semantic Colours

| Token | Usage | Hex |
|-------|-------|-----|
| `color-surface` | Page / panel background | `#0F1117` |
| `color-surface-raised` | Cards, ticket rows | `#1A1D27` |
| `color-surface-overlay` | Modals, drawers | `#20232F` |
| `color-surface-internal-note` | Internal note background | `#2A2410` |
| `color-border` | Dividers, input borders | `#2E3148` |
| `color-text-primary` | Body text, labels | `#E8EAF0` |
| `color-text-secondary` | Metadata, timestamps | `#8B90A8` |
| `color-text-muted` | Placeholders, disabled | `#52566E` |
| `color-accent` | Primary actions, links, focus rings | `#6366F1` |
| `color-accent-hover` | Hover state of accent | `#4F52E0` |
| `color-success` | Resolved status | `#22C55E` |
| `color-warning` | Pending / SLA at risk | `#F59E0B` |
| `color-danger` | Urgent / SLA breached / destructive | `#EF4444` |
| `color-escalated` | Escalated status badge | `#A855F7` |
| `color-info` | Open status badge | `#3B82F6` |

All pairs meet WCAG 2.1 AA (≥ 4.5:1 body, ≥ 3:1 large text). `color-text-muted`
(~3.9:1) is for placeholder/disabled text only.

### Priority Colours

| Priority | Token | Usage |
|----------|--------|-------|
| `urgent` | `color-danger` | Red label + left border |
| `high` | `color-warning` | Amber label |
| `medium` | `color-info` | Blue label |
| `low` | `color-text-muted` | Grey label |

### Status Badge Colours

| Status | Background | Text |
|--------|-----------|------|
| `open` | `color-info` at 15% opacity | `color-info` |
| `pending` | `color-warning` at 15% opacity | `color-warning` |
| `resolved` | `color-success` at 15% opacity | `color-success` |
| `escalated` | `color-escalated` at 15% opacity | `color-escalated` |

---

## Typography

| Role | Size | Weight | Token |
|------|------|--------|-------|
| Page heading | 20px | 600 | `text-page-heading` |
| Section heading | 14px | 600 | `text-section-heading` |
| Body | 14px | 400 | `text-body` |
| Body small | 12px | 400 | `text-body-sm` |
| Label / badge | 11px | 500 uppercase | `text-label` |
| Mono (IDs, timestamps) | 12px | 400 | `text-mono` |

- Font: **Inter** (primary), system-ui fallback. Line height: 1.5 body, 1.2 headings.
- Never use font sizes below 11px.

---

## Spacing

Tailwind's 4px base scale. Prefer named steps:

| Token | Size | Use |
|-------|------|-----|
| `space-1` | 4px | Icon gaps |
| `space-2` | 8px | Within components (icon + label) |
| `space-3` | 12px | Component internal padding |
| `space-4` | 16px | Between siblings |
| `space-5` | 20px | Panel inset, card groups |
| `space-6` | 24px | Section separation |
| `space-8` | 32px | Panel padding |

---

## Z-Index

| Token | Value | Usage |
|-------|-------|-------|
| `z-dropdown` | 100 | Dropdown menus |
| `z-sticky` | 200 | Sticky headers |
| `z-modal-backdrop` | 300 | Overlays |
| `z-modal` | 400 | Modal panels |
| `z-toast` | 500 | Toasts |

---

## Animation

| Token | Value | Usage |
|-------|-------|-------|
| `duration-fast` | 150ms | Hover, focus ring |
| `duration-normal` | 200ms | Default |
| `duration-slow` | 300ms | Panel open/close |
| `easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard |
| `easing-enter` | `cubic-bezier(0, 0, 0.2, 1)` | Elements appearing |
| `easing-leave` | `cubic-bezier(0.4, 0, 1, 1)` | Elements disappearing |

Prefer `transition-colors`, `transition-opacity`, `transition-transform` over
`transition-all`.

---

## Component Primitives

### Button

Three variants: `primary` (one per view), `secondary` (supporting), `ghost` (low-emphasis).

Optional `intent` prop: `default` or `danger` (tints with `color-danger` for destructive
actions — never a full red primary button).

```tsx
<Button variant="primary">Send Reply</Button>
<Button variant="secondary" intent="danger">Close Ticket</Button>
```

Sizes: `sm` (28px), `md` (36px default), `lg` (44px — empty states only).
Icon-only buttons require `aria-label`.

---

### Badge

For ticket status and priority labels only. No custom colours.

```tsx
<Badge status="open" />       // Blue
<Badge priority="urgent" />   // Red
```

---

### Avatar

| Size | Pixel | Usage |
|------|-------|-------|
| `sm` | 24px | Inline in ticket rows |
| `md` | 32px | Assignment dropdown |
| `lg` | 40px | Customer context panel |

```tsx
<Avatar src={user.avatar_url} name={user.name} size="sm" />
```

Falls back to two-letter initials on `color-accent`. Always `aria-label={name}`.

---

### Tooltip

Shows on hover/focus, hides on click/blur. Position: top. Uses `role="tooltip"` with
`aria-describedby` on trigger.

```tsx
<Tooltip content="Escalate ticket">
  <button aria-label="Escalate" onClick={handleEscalate}>
    <ArrowUpRight size={16} />
  </button>
</Tooltip>
```

---

### Skeleton

Used for loading placeholders. Base colour: `bg-border`. Animation: `animate-pulse`.

| Pattern | Classes |
|---------|---------|
| Text line | `h-3 w-<variable> rounded` |
| Avatar | `h-6 w-6 rounded-full` |
| Row | `h-12 w-full rounded` |
| Card | `h-24 w-full rounded-lg` |
| Paragraph | `space-y-2` with 3 lines |

```tsx
<Skeleton className="h-12 w-full rounded" />
```

---

### Modal

Used for escalation, confirmations. API:

```tsx
<Modal open={isOpen} onClose={handleClose} aria-labelledby="title">
  <Modal.Header>
    <h2 id="title">Confirm</h2>
    <Modal.CloseButton aria-label="Close" />
  </Modal.Header>
  <Modal.Body>{/* content */}</Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </Modal.Footer>
</Modal>
```

Behaviour: `bg-black/50` overlay click-to-close, centred `max-w-[480px]` panel,
Escape key closes, focus trapped while open, focus returns to trigger on close.
`role="dialog"`, `aria-modal="true"`.

---

### Form Inputs

Consistent classes — do not apply ad-hoc styling:

```tsx
<input className="w-full bg-surface-raised border border-border rounded px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent" />
```

Same pattern for `<select>` and `<textarea>`. Every input has an associated `<label>`.
Error: add `border-danger` + `role="alert"`. Disabled: `opacity-50 cursor-not-allowed`.

---

### Ticket Row

Anatomy: checkbox, 3px colour-coded left border, title + customer name (stacked),
status badge, avatar, SLA due timestamp (amber < 30 min, red breached), quick action
icons (hover only).

Hover: `color-surface-overlay`. Selected: `color-accent` at 8% + full left border.

---

### Ticket Detail Layout

```
┌───────────────────────────────────────────────┬─────────────────┐
│ Conversation thread (scrollable)              │ Customer Panel  │
│  [Customer message]                           │ Name, Email     │
│  [Agent reply]                                │ Open/Past tix   │
│  [Internal note — distinct bg]                │ Metadata        │
├───────────────────────────────────────────────┴─────────────────┤
│ Reply box + [Macro] [Note toggle] [Assign] [Send Reply ▶]      │
└─────────────────────────────────────────────────────────────────┘
```

Context panel: 280px, collapsible < 1280px. Internal notes use
`bg-surface-internal-note`. Thread lazy loads in batches of 20.

---

### Escalation Modal

480px centred, preloaded ticket context (read-only), required target team select,
optional notes textarea. Submit disabled until target selected. Inline spinner on
submit. Error keeps modal open.

---

### Manager Dashboard

4-up metric cards (value, label, trend indicator). Agent workload: horizontal bars
(green < 70%, amber < 90%, red ≥ 90%). Volume trend: 7-day line chart. Empty state:
`—` with "No data yet". Skeleton loaders on initial load.

---

## Iconography

**Lucide React** exclusively. Sizes: 16px inline, 20px action buttons, 24px empty
states. Always paired with text label or `aria-label`.

| Action | Icon |
|--------|------|
| Escalate | `ArrowUpRight` |
| Assign | `UserCheck` |
| Close ticket | `CheckCircle` |
| Internal note | `Lock` |
| Search | `Search` |
| Filter | `SlidersHorizontal` |
| Priority urgent | `AlertCircle` |
| SLA breached | `Clock` (red) |

---

## Empty States

Every data surface: Lucide icon (muted, 48px), heading, subtext, optional CTA.

---

## Loading States

Skeleton loaders for initial load, inline spinner for mutations, skeleton rows for
pagination, stale timestamp for dashboard. Never a full-page spinner.

---

## Accessibility

- Keyboard-reachable in logical tab order.
- Focus ring: `focus-visible:ring-2 focus-visible:ring-accent` — never `outline: none`
  without replacement.
- Colour is never the only differentiator.
- Touch target ≥ 44×44px on mobile.
- All inputs have `<label>`.
- Live updates via `aria-live="polite"`.
- Modals trap focus; return to trigger on close.
- Test with VoiceOver and NVDA.

---

## Responsive Behaviour

| Breakpoint | Layout |
|-----------|--------|
| < 768px | Stacked card inbox, full-screen detail, drawer sidebar, shortcuts disabled |
| 768–1279px | Context panel collapsed, two-column |
| ≥ 1280px | Three-column, context panel visible |

---

## What the Agent Must Never Do

- Never introduce a colour not in the token palette.
- Never use raw hex values in component JSX.
- Never build a fourth button variant without updating this file.
- Never render an icon without an accessible label.
- Never show a blank screen as a loading or empty state.
- Never use `color-danger` for anything except destructive actions, urgent priority,
  or SLA breach.
