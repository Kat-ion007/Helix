"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/browser"
import { withTimeout } from "@/lib/supabase/query"
import { useTicketStore, TicketWithDetails } from "@/store/ticket-store"
import { toast } from "@/store/toast-store"
import { useUserStore } from "@/store/user-store"
import { TicketStatus, TicketPriority } from "@/types"

function getErrorMessage(err: unknown): string {
  // Supabase PostgREST error shape: { message, details, hint, code }
  if (typeof err === "object" && err !== null) {
    const pgErr = err as { message?: string; code?: string }
    
    // PGRST116: .single() returned 0 rows — typically an RLS denial
    // 42501: PostgreSQL insufficient_privilege — RLS WITH CHECK rejection
    if (pgErr.code === "PGRST116" || pgErr.code === "42501") {
      return "Update blocked — you do not have permission to modify this ticket."
    }

    if (pgErr.message) return pgErr.message
  }

  if (err instanceof Error) return err.message

  return "Failed to update ticket. Rollback applied."
}

export function useUpdateTicket() {
  const { getTicket, upsertTicket } = useTicketStore()
  const { profile } = useUserStore()
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

    // Auto-assign unassigned tickets to the current agent when they resolve or change status from open
    const finalUpdates = { ...updates }
    if (
      profile?.role === "agent" &&
      previous.assigned_to === null &&
      finalUpdates.status &&
      finalUpdates.status !== "open" &&
      finalUpdates.assigned_to === undefined
    ) {
      finalUpdates.assigned_to = profile.id
    }

    // 2. Apply optimistic update
    upsertTicket({
      ...previous,
      ...finalUpdates,
      updated_at: new Date().toISOString(),
    } as TicketWithDetails)

    setUpdating(true)

    try {
      const { data, error } = await withTimeout(Promise.resolve(supabase
        .from("ticket")
        .update(finalUpdates)
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
        .single()), 15000)

      if (error) throw error

      if (!data) {
        throw new Error("Update blocked — you may not have permission to modify this ticket.")
      }

      // 3. Confirm with server state
      upsertTicket(data as TicketWithDetails)
      toast.success("Ticket updated successfully.")
    } catch (err: unknown) {
      // 4. Rollback on failure
      const isPermissionErr = typeof err === "object" && err !== null && 
        ("code" in err && (err.code === "PGRST116" || err.code === "42501"))

      if (isPermissionErr) {
        console.warn("[useUpdateTicket] Permission blocked ticket update:", err)
      } else {
        console.error("[useUpdateTicket] Error updating ticket:", JSON.stringify(err, null, 2), err)
      }
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
