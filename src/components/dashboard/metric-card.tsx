"use client"

import type { ReactNode } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  label: string
  value: ReactNode
  trend?: "up" | "down" | "neutral"
  trendLabel?: string
  isLoading?: boolean
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

const trendColours = {
  up: "text-success bg-success/10 border-success/20",
  down: "text-danger bg-danger/10 border-danger/20",
  neutral: "text-text-secondary bg-surface border-border",
}

export function MetricCard({ label, value, trend, trendLabel, isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="bg-surface-raised rounded-xl p-5 border border-border/80 animate-pulse select-none">
        <div className="h-3 w-24 bg-border/40 rounded mb-3" />
        <div className="h-8 w-16 bg-border/40 rounded" />
      </div>
    )
  }

  const TrendIcon = trend ? trendIcons[trend] : null
  const badgeColour = trend ? trendColours[trend] : ""

  return (
    <div className="bg-surface-raised rounded-xl p-5 border border-border/80 flex flex-col justify-between shadow-xs select-none">
      <div>
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">{label}</p>
        <p className="text-2xl font-bold text-text-primary tracking-tight">{value}</p>
      </div>
      {trend && trendLabel && TrendIcon && (
        <div className="mt-3 flex">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${badgeColour}`}>
            <TrendIcon size={12} aria-hidden="true" />
            <span>{trendLabel}</span>
          </span>
        </div>
      )}
    </div>
  )
}
