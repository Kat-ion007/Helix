"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react"
import { ResolutionTrend } from "@/store/dashboard-store"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

interface ResolutionTrendChartProps {
  trend: ResolutionTrend[]
  loading?: boolean
}

export function ResolutionTrendChart({ trend, loading = false }: ResolutionTrendChartProps) {
  // Guard for hydration matching
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (loading || !mounted) {
    return (
      <div className="bg-surface-raised rounded-xl p-5 border border-border/80 animate-pulse space-y-4 h-64 select-none">
        <div className="h-4 w-40 bg-border/40 rounded" />
        <div className="h-full w-full bg-border/20 rounded" />
      </div>
    )
  }

  const chartData = trend.map((t) => {
    const formattedDate = t.resolved_date
      ? new Date(t.resolved_date).toLocaleDateString([], { weekday: "short", month: "numeric", day: "numeric" })
      : ""
    return {
      date: formattedDate,
      count: t.resolved_count || 0,
    }
  })

  return (
    <div className="bg-surface-raised rounded-xl p-5 border border-border/80 flex flex-col h-64 shadow-xs select-none">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <TrendingUp size={16} className="text-text-secondary" />
        <span>7-Day Resolution Volume Trend</span>
      </h3>

      <div className="flex-1 w-full min-h-0 text-[10px] font-mono text-text-secondary">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-xs text-text-secondary">
            No resolution data for the past 7 days.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="var(--color-text-secondary)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-text-secondary)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface-overlay)",
                  borderColor: "var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--color-text-primary)",
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-accent)"
                radius={[4, 4, 0, 0]}
                name="Resolved Tickets"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
