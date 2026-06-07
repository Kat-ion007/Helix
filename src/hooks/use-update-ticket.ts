"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { supabase } from "@/lib/supabase/browser"
import { useTicketStore } from "@/store/ticket-store"
import { toast } from "@/store/toast-store"
import { TicketStatus, TicketPriority } from "@/types"

export function useUpdateTicket() {
  const { getTicket, upsertTicket } = useTicketStore()
  const [updating, setUpdating] = useState(false)

  const updateTicket = async (
    ticketId: string,
    updates: {
      status?: TicketStatus
      priority?: TicketPriority
      assigned_to?: string | null
    }
  ) => {
    // 1. Snapshot for rollback
    const previous = getTicket(ticketId)
    if (!previous) return

    // 2. Apply optimistic update
    upsertTicket({
      ...previous,
      ...updates,
      updated_at: new Date().toISOString(),
    } as any)

    setUpdating(true)

    try {
      const { data, error } = await (supabase.from("ticket") as any)
        .update(updates)
        .eq("id", ticketId)
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
            customer:customer_id (id, name, email, metadata),
            assigned_user:assigned_to (id, name, email, role)
          `
        )
        .single()

      if (error) throw error

      // 3. Confirm with server state
      upsertTicket(data as any)
      toast.success("Ticket updated successfully.")
    } catch (err: any) {
      // 4. Rollback on failure
      console.error("[useUpdateTicket] Error updating ticket:", err)
      upsertTicket(previous)
      toast.error(err?.message || "Failed to update ticket. Rollback applied.")
    } finally {
      setUpdating(false)
    }
  }

  return {
    updateTicket,
    updating,
  }
}
