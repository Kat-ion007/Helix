"use client"

import { Clock, UserCheck, RefreshCw } from "lucide-react"
import { User } from "@/types"

interface ActivityWithActor {
  id: string
  ticket_id: string
  actor_id: string | null
  action: string
  previous_value: unknown
  new_value: unknown
  created_at: string
  actor?: {
    id: string
    name: string
  } | null
}

interface ActivityLogListProps {
  activities: ActivityWithActor[]
  agents: User[]
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

export function ActivityLogList({ activities, agents }: ActivityLogListProps) {
  const getAgentName = (userId: string | null) => {
    if (!userId) return "Unassigned"
    const agent = agents.find((a) => a.id === userId)
    return agent ? agent.name : "Unknown Agent"
  }

  if (activities.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-text-secondary select-none bg-surface/20">
        <Clock size={32} className="text-text-muted mb-2" />
        <p className="text-sm font-semibold">No activity logs found</p>
        <p className="text-xs text-text-muted mt-1">
          Modifications to this ticket&apos;s status or assignment will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col min-h-0 bg-surface/20">
      <div className="relative pl-6 border-l border-border/60 ml-4 space-y-6">
        {activities.map((act) => {
          const actorName = act.actor?.name || "System"
          const dateStr = formatDate(act.created_at)

          let icon = <Clock size={12} className="text-text-secondary" />
          let bgColor = "bg-surface-raised border-border"
          let description = ""

          if (act.action === "status_change") {
            const prev = act.previous_value as Record<string, unknown> | null
            const next = act.new_value as Record<string, unknown> | null
            const oldStatus = (prev?.status as string) || "unknown"
            const newStatus = (next?.status as string) || "unknown"

            icon = <RefreshCw size={12} className="text-accent" />
            bgColor = "bg-accent/10 border-accent/20"
            description = `${actorName} updated status from ${oldStatus} to ${newStatus}`
          } else if (act.action === "assignment_change") {
            const prev = act.previous_value as Record<string, unknown> | null
            const next = act.new_value as Record<string, unknown> | null
            const oldAssigneeId = (prev?.assigned_to as string | null | undefined) ?? null
            const newAssigneeId = (next?.assigned_to as string | null | undefined) ?? null

            const oldName = getAgentName(oldAssigneeId)
            const newName = getAgentName(newAssigneeId)

            icon = <UserCheck size={12} className="text-info" />
            bgColor = "bg-info/10 border-info/20"

            if (!oldAssigneeId && newAssigneeId) {
              description = `${actorName} assigned ticket to ${newName}`
            } else if (oldAssigneeId && !newAssigneeId) {
              description = `${actorName} unassigned ticket (was assigned to ${oldName})`
            } else {
              description = `${actorName} reassigned ticket from ${oldName} to ${newName}`
            }
          } else {
            description = `${actorName} performed action: ${act.action}`
          }

          return (
            <div key={act.id} className="relative flex items-start gap-4">
              {/* Timeline dot */}
              <div
                className={`absolute -left-[31px] mt-1.5 h-4.5 w-4.5 rounded-full flex items-center justify-center border ${bgColor} shadow-sm shrink-0`}
              >
                {icon}
              </div>

              {/* Log Details */}
              <div className="bg-surface-raised/50 border border-border/30 rounded-lg p-3.5 flex-1 min-w-0 shadow-xs hover:border-border/60 transition-colors">
                <p className="text-sm text-text-primary font-medium leading-relaxed">
                  {description}
                </p>
                <span className="text-[10px] text-text-muted mt-1 block font-mono select-none">
                  {dateStr}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

