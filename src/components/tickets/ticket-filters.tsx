"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/browser"
import { useInboxFilterStore, FilterStatus, FilterPriority, FilterAssignment } from "@/store/inbox-filter-store"
import { Search, X, SlidersHorizontal } from "lucide-react"

interface Agent {
  id: string
  name: string
  role: string
}

export function TicketFilters() {
  const {
    status,
    priority,
    assignedTo,
    searchQuery,
    setStatus,
    setPriority,
    setAssignedTo,
    setSearchQuery,
    resetFilters,
  } = useInboxFilterStore()

  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    async function loadAgents() {
      try {
        const { data, error } = await supabase
          .from("user")
          .select("id, name, role")
          .order("name", { ascending: true })

        if (error) throw error
        setAgents(data || [])
      } catch (err) {
        console.error("[TicketFilters] Failed to load agents for filters:", err)
      }
    }
    loadAgents()
  }, [])

  const hasActiveFilters =
    status !== "all" || priority !== "all" || assignedTo !== "all" || searchQuery !== ""

  return (
    <div className="bg-surface-raised p-4 rounded-lg border border-border flex flex-col gap-4">
      {/* Top row: search & headers */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.currentTarget.blur()
              }
            }}
            placeholder="Search tickets by title, description..."
            className="block w-full bg-surface/50 border border-border/80 rounded-lg pl-9 pr-8 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary focus:outline-none"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors px-3 py-1.5 rounded-lg border border-accent/20 hover:bg-accent/5 cursor-pointer flex items-center gap-1 shrink-0 self-end sm:self-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Bottom row: dropdown selects */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-text-secondary text-xs font-semibold uppercase tracking-wider shrink-0 select-none">
          <SlidersHorizontal size={14} />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1">
          <select
            id="filter-status"
            aria-label="Filter by Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as FilterStatus)}
            className="bg-surface/50 border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-col gap-1">
          <select
            id="filter-priority"
            aria-label="Filter by Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as FilterPriority)}
            className="bg-surface/50 border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div className="flex flex-col gap-1">
          <select
            id="filter-assignee"
            aria-label="Filter by Assigned Agent"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value as FilterAssignment)}
            className="bg-surface/50 border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent cursor-pointer"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.role})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
