import { create } from "zustand"

export interface AgentWorkload {
  agent_id: string | null
  agent_name: string | null
  agent_role: string | null
  ticket_count: number | null
}

export interface ResolutionTrend {
  resolved_date: string | null
  resolved_count: number | null
}

interface DashboardStore {
  statusCounts: Record<string, number>
  slaBreaches: number
  agentWorkload: AgentWorkload[]
  resolutionTrend: ResolutionTrend[]
  lastUpdated: string | null
  setMetrics: (metrics: {
    statusCounts: Record<string, number>
    slaBreaches: number
    agentWorkload: AgentWorkload[]
    resolutionTrend: ResolutionTrend[]
  }) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  statusCounts: { open: 0, pending: 0, resolved: 0, escalated: 0 },
  slaBreaches: 0,
  agentWorkload: [],
  resolutionTrend: [],
  lastUpdated: null,
  setMetrics: (metrics) =>
    set({
      ...metrics,
      lastUpdated: new Date().toISOString(),
    }),
}))
