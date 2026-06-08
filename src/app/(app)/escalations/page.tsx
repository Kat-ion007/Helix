"use client"

export const dynamic = "force-dynamic"

import { useEscalations } from "@/hooks/use-escalations"
import { EscalationHistoryTable } from "@/components/escalation/escalation-history-table"
import { ArrowUpRight, RefreshCw } from "lucide-react"

export default function EscalationsPage() {
  const { escalations, loading, error, refetch } = useEscalations()

  return (
    <div className="flex flex-col flex-1 p-6 max-w-7xl mx-auto w-full gap-6 animate-in fade-in duration-200 select-none">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight md:text-2xl flex items-center gap-2">
            <ArrowUpRight className="text-escalated" />
            <span>Escalation History</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Track active escalations and review handoff history.
          </p>
        </div>

        <button
          onClick={refetch}
          className="p-2 rounded-lg bg-surface-raised border border-border/80 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
          aria-label="Refresh escalation data"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Escalation Table */}
      <EscalationHistoryTable
        escalations={escalations}
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  )
}
