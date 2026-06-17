"use client"

import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import type { EscalationRecord } from "@/hooks/use-escalations"
import { ArrowUpRight, ArrowRight } from "lucide-react"

interface EscalationHistoryTableProps {
  escalations: EscalationRecord[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function EscalationStatusBadge({ status }: { status: string }) {
  const styles =
    status === "open"
      ? "bg-info/15 text-info border-info/20"
      : "bg-success/15 text-success border-success/20"

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${styles}`}
    >
      {status}
    </span>
  )
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} variant="row" className="h-14" />
      ))}
    </div>
  )
}

export function EscalationHistoryTable({
  escalations,
  loading,
  error,
  onRetry,
}: EscalationHistoryTableProps) {
  if (loading) {
    return <SkeletonRows />
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (escalations.length === 0) {
    return (
      <EmptyState
        icon={<ArrowUpRight size={48} />}
        heading="No escalations yet"
        subtext="Escalation records will appear here when tickets are escalated to other agents or leads."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Escalation history">
        <thead>
          <tr className="border-b border-border/60 text-left">
            <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Ticket
            </th>
            <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              From
            </th>
            <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">
              {/* Arrow column — decorative */}
            </th>
            <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              To
            </th>
            <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden md:table-cell">
              Reason
            </th>
            <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Status
            </th>
            <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden lg:table-cell">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {escalations.map((esc) => (
            <tr
              key={esc.id}
              className="border-b border-border/30 hover:bg-surface-raised/60 transition-colors"
            >
              {/* Ticket title — linked */}
              <td className="py-3 px-4 max-w-[220px]">
                <Link
                  href={`/tickets/${esc.ticket_id}`}
                  className="text-sm font-medium text-accent hover:underline truncate block"
                  title={esc.ticket?.title || "View ticket"}
                >
                  {esc.ticket?.title || `#${esc.ticket_id.substring(0, 8)}`}
                </Link>
                {esc.ticket?.status && (
                  <span className="text-[10px] text-text-muted capitalize mt-0.5 block">
                    {esc.ticket.status}
                  </span>
                )}
              </td>

              {/* From agent */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold uppercase border border-accent/15 shrink-0">
                    {esc.from?.name?.substring(0, 2) || "??"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {esc.from?.name || "Unknown"}
                    </p>
                    <p className="text-[10px] text-text-muted capitalize">
                      {esc.from?.role || ""}
                    </p>
                  </div>
                </div>
              </td>

              {/* Arrow — decorative, hidden on mobile */}
              <td className="py-3 px-2 text-text-muted hidden sm:table-cell">
                <ArrowRight size={14} />
              </td>

              {/* To agent */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-escalated/10 flex items-center justify-center text-escalated text-[10px] font-bold uppercase border border-escalated/15 shrink-0">
                    {esc.to?.name?.substring(0, 2) || "??"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {esc.to?.name || "Unknown"}
                    </p>
                    <p className="text-[10px] text-text-muted capitalize">
                      {esc.to?.role || ""}
                    </p>
                  </div>
                </div>
              </td>

              {/* Reason — hidden on small screens */}
              <td className="py-3 px-4 max-w-[200px] hidden md:table-cell">
                <p
                  className="text-xs text-text-secondary truncate"
                  title={esc.reason || "No reason provided"}
                >
                  {esc.reason || (
                    <span className="text-text-muted italic">No reason</span>
                  )}
                </p>
              </td>

              {/* Status badge */}
              <td className="py-3 px-4">
                <EscalationStatusBadge status={esc.status} />
              </td>

              {/* Date — hidden on small screens */}
              <td className="py-3 px-4 text-xs text-text-secondary text-mono hidden lg:table-cell whitespace-nowrap">
                {formatDate(esc.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
