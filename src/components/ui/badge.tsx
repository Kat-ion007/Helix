"use client"

import type { TicketStatus, TicketPriority } from "@/types"

interface BadgeProps {
  status?: TicketStatus
  priority?: TicketPriority
}

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-info/15 text-info",
  pending: "bg-warning/15 text-warning",
  resolved: "bg-success/15 text-success",
  escalated: "bg-escalated/15 text-escalated",
}

const priorityStyles: Record<TicketPriority, string> = {
  urgent: "bg-danger/15 text-danger border border-danger/20",
  high: "bg-warning/15 text-warning",
  medium: "bg-info/15 text-info",
  low: "bg-border/30 text-text-secondary",
}

export function Badge({ status, priority }: BadgeProps) {
  const label = status ?? priority ?? ""
  const styles = status
    ? statusStyles[status]
    : priority
    ? priorityStyles[priority]
    : ""

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${styles}`}
    >
      {label}
    </span>
  )
}
