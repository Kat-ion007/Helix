"use client"

import { AgentWorkload } from "@/store/dashboard-store"
import { Users } from "lucide-react"

interface AgentWorkloadChartProps {
  workload: AgentWorkload[]
  loading?: boolean
}

export function AgentWorkloadChart({ workload, loading = false }: AgentWorkloadChartProps) {
  if (loading) {
    return (
      <div className="bg-surface-raised rounded-xl p-5 border border-border/80 animate-pulse space-y-4 select-none">
        <div className="h-4 w-36 bg-border/40 rounded" />
        <div className="space-y-3">
          <div className="h-6 w-full bg-border/40 rounded" />
          <div className="h-6 w-full bg-border/40 rounded" />
          <div className="h-6 w-full bg-border/40 rounded" />
        </div>
      </div>
    )
  }

  // Define capacity threshold: 10 tickets represents 100% capacity
  const MAX_CAPACITY = 10

  const getWorkloadColour = (count: number) => {
    const percentage = (count / MAX_CAPACITY) * 100
    if (percentage < 70) return "bg-success"
    if (percentage < 90) return "bg-warning"
    return "bg-danger"
  }

  return (
    <div className="bg-surface-raised rounded-xl p-5 border border-border/80 flex flex-col h-full shadow-xs select-none">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <Users size={16} className="text-text-secondary" />
        <span>Agent Workload Distribution</span>
      </h3>

      {workload.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-xs text-text-secondary py-8">
          No agent workload data available.
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto">
          {workload.map((agent) => {
            const ticketCount = agent.ticket_count || 0
            const percentage = Math.min((ticketCount / MAX_CAPACITY) * 100, 100)
            const colorClass = getWorkloadColour(ticketCount)

            return (
              <div key={agent.agent_id || "unassigned"} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-text-primary truncate max-w-[150px]">
                    {agent.agent_name || "Unassigned Tickets"}
                  </span>
                  <span className="text-text-secondary">
                    {ticketCount} / {MAX_CAPACITY} tix ({Math.round(percentage)}%)
                  </span>
                </div>
                {/* Progress Bar Container */}
                <div className="h-2 w-full bg-surface border border-border/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colorClass} transition-all duration-500 rounded-full`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={ticketCount}
                    aria-valuemin={0}
                    aria-valuemax={MAX_CAPACITY}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
