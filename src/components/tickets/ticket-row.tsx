"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { formatSLADue, isSLABreached, isSLAWarning } from "@/utils/sla"
import type { TicketWithDetails } from "@/store/ticket-store"
import { Clock } from "lucide-react"

interface TicketRowProps {
  ticket: TicketWithDetails
  isSelected: boolean
  onSelect: (id: string) => void
  onOpen: (id: string) => void
}

export const TicketRow = memo(function TicketRow({
  ticket,
  isSelected,
  onSelect,
  onOpen,
}: TicketRowProps) {
  const slaBreached = isSLABreached(ticket.sla_due)
  const slaWarning = isSLAWarning(ticket.sla_due)

  const priorityBorders = {
    urgent: "border-l-danger",
    high: "border-l-warning",
    medium: "border-l-info",
    low: "border-l-border/40",
  }

  const priorityBorder = priorityBorders[ticket.priority] || "border-l-transparent"

  return (
    <div
      role="row"
      aria-selected={isSelected}
      tabIndex={0}
      className={`flex items-center gap-4 px-4 py-3.5 border-l-[3.5px] ${priorityBorder} transition-colors border-b border-border/40 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent outline-none select-none ${
        isSelected
          ? "bg-accent/10 hover:bg-accent/15"
          : "bg-surface-raised hover:bg-surface-overlay/75"
      }`}
      onClick={() => onOpen(ticket.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onOpen(ticket.id)
        }
      }}
    >
      {/* Checkbox */}
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          aria-label={`Select ticket: ${ticket.title}`}
          checked={isSelected}
          onChange={() => onSelect(ticket.id)}
          className="h-4 w-4 rounded border-border text-accent focus:ring-accent bg-surface cursor-pointer shrink-0"
        />
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-text-primary truncate">{ticket.title}</p>
          <span className="text-[10px] text-text-muted select-none text-mono shrink-0">
            #{ticket.id.substring(0, 6)}
          </span>
        </div>
        <p className="text-xs text-text-secondary truncate">
          {ticket.customer?.name || "Placeholder Profile"} • {ticket.customer?.email}
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge status={ticket.status} />
        <Badge priority={ticket.priority} />
      </div>

      {/* Assignee Avatar */}
      <div className="shrink-0 w-8 flex justify-center">
        {ticket.assigned_user ? (
          <Avatar name={ticket.assigned_user.name} size="sm" />
        ) : (
          <div className="h-6 w-6 rounded-full border border-dashed border-border/80 flex items-center justify-center text-[10px] text-text-muted font-medium bg-surface/30">
            —
          </div>
        )}
      </div>

      {/* SLA Due */}
      <div
        className={`flex items-center gap-1.5 text-xs font-medium shrink-0 min-w-[95px] justify-end ${
          slaBreached
            ? "text-danger"
            : slaWarning
            ? "text-warning"
            : "text-text-secondary"
        }`}
      >
        <Clock className="h-3.5 w-3.5" />
        <span className="text-mono">{formatSLADue(ticket.sla_due)}</span>
      </div>
    </div>
  )
})
