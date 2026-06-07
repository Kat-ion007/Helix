"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase/browser"
import { useDashboardStore } from "@/store/dashboard-store"

interface UseDashboardMetricsResult {
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboardMetrics(): UseDashboardMetricsResult {
  const setMetrics = useDashboardStore((state) => state.setMetrics)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchCounter = useRef(0)

  const fetchMetrics = useCallback(async () => {
    const currentFetchId = ++fetchCounter.current
    setError(null)

    try {
      const statusCountsPromise = supabase
        .from("v_ticket_status_counts")
        .select("status, count")

      const slaBreachPromise = supabase
        .from("v_sla_breach_count")
        .select("count")
        .maybeSingle()

      const agentWorkloadPromise = supabase
        .from("v_agent_workload")
        .select("agent_id, agent_name, agent_role, ticket_count")

      const resolutionTrendPromise = supabase
        .from("v_resolution_trend")
        .select("resolved_date, resolved_count")
        .order("resolved_date", { ascending: true })

      const [statusCountsRes, slaBreachRes, agentWorkloadRes, resolutionTrendRes] = await Promise.all([
        statusCountsPromise,
        slaBreachPromise,
        agentWorkloadPromise,
        resolutionTrendPromise,
      ])

      if (statusCountsRes.error) throw statusCountsRes.error
      if (slaBreachRes.error) throw slaBreachRes.error
      if (agentWorkloadRes.error) throw agentWorkloadRes.error
      if (resolutionTrendRes.error) throw resolutionTrendRes.error

      if (currentFetchId === fetchCounter.current) {
        // Map status counts list to Record
        const statusMap: Record<string, number> = { open: 0, pending: 0, resolved: 0, escalated: 0 }
        if (statusCountsRes.data) {
          statusCountsRes.data.forEach((row: any) => {
            if (row.status) {
              statusMap[row.status] = row.count || 0
            }
          })
        }

        setMetrics({
          statusCounts: statusMap,
          slaBreaches: (slaBreachRes.data as any)?.count || 0,
          agentWorkload: agentWorkloadRes.data || [],
          resolutionTrend: resolutionTrendRes.data || [],
        })
      }
    } catch (err: any) {
      console.error("[useDashboardMetrics] Fetch error:", err)
      if (currentFetchId === fetchCounter.current) {
        setError(err?.message || "Failed to load dashboard metrics.")
      }
    } finally {
      if (currentFetchId === fetchCounter.current) {
        setLoading(false)
      }
    }
  }, [setMetrics])

  // Initial load and set interval for 30s refetch
  useEffect(() => {
    fetchMetrics()

    const interval = setInterval(() => {
      console.info("[Dashboard] Triggering 30s auto-refresh...")
      fetchMetrics()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchMetrics])

  return {
    loading,
    error,
    refetch: fetchMetrics,
  }
}
