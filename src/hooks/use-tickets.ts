"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase/browser"
import { withTimeout } from "@/lib/supabase/query"
import { useInboxFilterStore } from "@/store/inbox-filter-store"
import { useTicketStore, type TicketWithDetails } from "@/store/ticket-store"

interface UseTicketsResult {
  tickets: TicketWithDetails[]
  loading: boolean
  error: string | null
  refetch: () => void
  totalCount: number
  page: number
  setPage: (page: number) => void
}

const ITEMS_PER_PAGE = 25

export function useTickets(): UseTicketsResult {
  const { status, priority, assignedTo, sortBy, sortOrder, searchQuery, page, setPage } = useInboxFilterStore()
  const { tickets, setTickets } = useTicketStore()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Track page count separately so we don't fetch if unmounted
  const fetchCounter = useRef(0)

  const fetchTickets = useCallback(async (currentPage: number) => {
    const currentFetchId = ++fetchCounter.current
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from("ticket")
        .select(
          `
            id,
            title,
            description,
            status,
            priority,
            customer_id,
            assigned_to,
            created_at,
            updated_at,
            sla_due,
            customer:customer_id (id, name, email),
            assigned_user:assigned_to (id, name, email, role)
          `,
          { count: "exact" }
        )

      // Apply Filters
      if (status !== "all") {
        query = query.eq("status", status)
      }

      if (priority !== "all") {
        query = query.eq("priority", priority)
      }

      if (assignedTo === "unassigned") {
        query = query.is("assigned_to", null)
      } else if (assignedTo !== "all") {
        query = query.eq("assigned_to", assignedTo)
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Sorting
      query = query.order(sortBy === "sla_due" ? "sla_due" : "created_at", {
        ascending: sortOrder === "asc",
        nullsFirst: false, // Ensure tickets without SLA appear at the end when sorting by SLA
      })

      // Pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error: fetchError, count } = await withTimeout(Promise.resolve(query), 15000)

      if (fetchError) {
        throw fetchError
      }

      if (currentFetchId === fetchCounter.current) {
        const typedData = (data || []) as unknown as TicketWithDetails[]
        // Store in global ticket store
        setTickets(typedData)
        setTotalCount(count || 0)
      }
    } catch (err: any) {
      console.error("[useTickets] Error fetching tickets:", err)
      if (currentFetchId === fetchCounter.current) {
        let msg = "Failed to load tickets. Please try again."
        if (err && typeof err === "object") {
          if (err.code === "PGRST116" || err.code === "42501") {
            msg = "You do not have permission to view these tickets."
          } else if (err.message) {
            msg = err.message
          }
        }
        setError(msg)
      }
    } finally {
      if (currentFetchId === fetchCounter.current) {
        setLoading(false)
      }
    }
  }, [status, priority, assignedTo, sortBy, sortOrder, searchQuery, setTickets])

  useEffect(() => {
    fetchTickets(page)
  }, [fetchTickets, page])

  const refetch = useCallback(() => {
    fetchTickets(page)
  }, [fetchTickets, page])

  // Get current tickets from the store matching the IDs fetched (to respect sort order and state updates)
  const currentTickets = useInboxFilterStore.getState().searchQuery
    ? Object.values(tickets) // Fallback to store values
    : Object.values(tickets).sort((a, b) => {
        // Simple sorting helper matching the current sort filter to render store updates nicely
        if (sortBy === "sla_due") {
          if (!a.sla_due) return 1
          if (!b.sla_due) return -1
          return sortOrder === "asc"
            ? new Date(a.sla_due).getTime() - new Date(b.sla_due).getTime()
            : new Date(b.sla_due).getTime() - new Date(a.sla_due).getTime()
        } else {
          return sortOrder === "asc"
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
      })

  return {
    tickets: currentTickets,
    loading,
    error,
    refetch,
    totalCount,
    page,
    setPage,
  }
}
