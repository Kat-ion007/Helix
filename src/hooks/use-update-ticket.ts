"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/browser"
import { useTicketStore, TicketWithDetails } from "@/store/ticket-store"
import { toast } from "@/store/toast-store"
import { TicketStatus, TicketPriority } from "@/types"

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message

  // Supabase PostgREST error shape: { message, details, hint, code }
  if (typeof err === "object" && err !== null) {
    const pgErr = err as { message?: string; code?: string }
    if (pgErr.message) return pgErr.message

    // PGRST116: .single() returned 0 rows — typically an RLS denial
    // 42501: PostgreSQL insufficient_privilege — RLS WITH CHECK rejection
    if (pgErr.code === "PGRST116" || pgErr.code === "42501") {
      return "Update blocked — you may not have permission to modify this ticket."
    }
  }

  return "Failed to update ticket. Rollback applied."
}

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
  ): Promise<void> => {
    // 1. Snapshot for rollback
    const previous = getTicket(ticketId)
    if (!previous) return

    // 2. Apply optimistic update
    upsertTicket({
      ...previous,
      ...updates,
      updated_at: new Date().toISOString(),
    } as TicketWithDetails)

    setUpdating(true)

    try {
      const { data, error } = await supabase
        .from("ticket")
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

      if (!data) {
        throw new Error("Update blocked — you may not have permission to modify this ticket.")
      }

      // 3. Confirm with server state
      upsertTicket(data as TicketWithDetails)
      toast.success("Ticket updated successfully.")
    } catch (err: unknown) {
      // 4. Rollback on failure
      console.error("[useUpdateTicket] Error updating ticket:", JSON.stringify(err, null, 2), err)
      upsertTicket(previous)
      toast.error(getErrorMessage(err))
    } finally {
      setUpdating(false)
    }
  }

  return {
    updateTicket,
    updating,
  }
}
