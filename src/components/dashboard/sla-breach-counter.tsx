"use client"

import { Clock, ShieldAlert } from "lucide-react"

interface SLABreachCounterProps {
  count: number
  lastUpdated: string | null
  loading?: boolean
}

export function SLABreachCounter({ count, lastUpdated, loading = false }: SLABreachCounterProps) {
  if (loading) {
    return (
      <div className="bg-surface-raised rounded-xl p-5 border border-border/80 animate-pulse flex items-center justify-between select-none">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-border/40 rounded" />
          <div className="h-6 w-16 bg-border/40 rounded" />
        </div>
        <div className="h-10 w-10 bg-border/40 rounded-full" />
      </div>
    )
  }

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : ""

  return (
    <div className="bg-surface-raised rounded-xl p-5 border border-border/80 flex items-center justify-between shadow-xs select-none">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          SLA Breached Tickets
        </p>
        <p className="text-2xl font-bold text-danger tracking-tight">{count}</p>
        {lastUpdated && (
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
            Last sync: {formattedTime}
          </p>
        )}
      </div>

      <div className={`h-11 w-11 rounded-full flex items-center justify-center border shrink-0 ${
        count > 0
          ? "bg-danger/10 border-danger/30 text-danger animate-pulse"
          : "bg-surface-overlay border-border/60 text-text-muted"
      }`}>
        {count > 0 ? <ShieldAlert size={20} /> : <Clock size={20} />}
      </div>
    </div>
  )
}
