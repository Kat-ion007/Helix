"use client"

import { ReactNode } from "react"

interface EmptyStateProps {
  icon: ReactNode
  heading: string
  subtext: string
  action?: ReactNode
}

export function EmptyState({ icon, heading, subtext, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-surface-raised/40 rounded-xl border border-border/50 max-w-lg mx-auto my-8">
      <div className="mb-4 text-text-muted flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1.5">{heading}</h3>
      <p className="text-sm text-text-secondary leading-normal max-w-sm mb-5">{subtext}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}
