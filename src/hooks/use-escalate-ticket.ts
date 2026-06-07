"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { supabase } from "@/lib/supabase/browser"
import { useUserStore } from "@/store/user-store"
import { toast } from "@/store/toast-store"

export function useEscalateTicket() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const profile = useUserStore((state) => state.profile)

  const escalate = async (ticketId: string, toUserId: string, reason: string) => {
    if (!profile) {
      toast.error("You must be logged in to escalate tickets.")
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.rpc("escalate_ticket", {
        p_ticket_id: ticketId,
        p_from_user: profile.id,
        p_to_user: toUserId,
        p_reason: reason || undefined,
      } as any)

      if (error) throw error

      toast.success("Ticket escalated successfully.")
    } catch (err: any) {
      console.error("[useEscalateTicket] RPC failed:", err)
      toast.error(err?.message || "Failed to escalate ticket. Please try again.")
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    escalate,
    isSubmitting,
  }
}
