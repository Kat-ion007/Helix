"use client"

export const dynamic = "force-dynamic"

import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics"
import { useDashboardRealtime } from "@/lib/realtime/use-dashboard-realtime"
import { useDashboardStore } from "@/store/dashboard-store"
import { MetricCard } from "@/components/dashboard/metric-card"
import { AgentWorkloadChart } from "@/components/dashboard/agent-workload-chart"
import { ResolutionTrendChart } from "@/components/dashboard/resolution-trend-chart"
import { SLABreachCounter } from "@/components/dashboard/sla-breach-counter"
import { RefreshCw, LayoutDashboard } from "lucide-react"

export default function DashboardPage() {
  const { loading, refetch } = useDashboardMetrics()
  const { statusCounts, slaBreaches, agentWorkload, resolutionTrend, lastUpdated } = useDashboardStore()

  // Realtime subscription: trigger a debounced refetch when ticket events occur
  useDashboardRealtime(refetch)

  const handleRefresh = () => {
    refetch()
  }

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : ""

  return (
    <div className="flex flex-col flex-1 p-6 max-w-7xl mx-auto w-full gap-6 animate-in fade-in duration-200 select-none">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight md:text-2xl flex items-center gap-2">
            <LayoutDashboard className="text-accent" />
            <span>Manager Dashboard</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Real-time SLA tracking and workload statistics.
            {lastUpdated && ` Last synced at ${formattedTime}.`}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg bg-surface-raised border border-border/80 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
          aria-label="Refresh metrics data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Grid of Key Status Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Open Tickets" value={statusCounts.open} isLoading={loading} />
        <MetricCard label="Pending Tickets" value={statusCounts.pending} isLoading={loading} />
        <MetricCard label="Escalated Tickets" value={statusCounts.escalated} isLoading={loading} />
        <MetricCard label="Resolved Tickets" value={statusCounts.resolved} isLoading={loading} />
      </div>

      {/* SLA Breach Counter (Large focus widget) */}
      <SLABreachCounter count={slaBreaches} lastUpdated={lastUpdated} loading={loading} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <AgentWorkloadChart workload={agentWorkload} loading={loading} />
        <ResolutionTrendChart trend={resolutionTrend} loading={loading} />
      </div>
    </div>
  )
}
