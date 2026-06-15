"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/browser"
import { withTimeout } from "@/lib/supabase/query"
import { useTicketStore, type TicketWithDetails } from "@/store/ticket-store"
import { useMessageStore, type MessageWithStatus } from "@/store/message-store"
import { useUserStore } from "@/store/user-store"
import { toast } from "@/store/toast-store"

interface ActivityWithActor {
  id: string
  ticket_id: string
  actor_id: string | null
  action: string
  previous_value: any
  new_value: any
  created_at: string
  actor?: {
    id: string
    name: string
  } | null
}

interface UseTicketDetailResult {
  ticket: TicketWithDetails | undefined
  messages: MessageWithStatus[]
  activities: ActivityWithActor[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTicketDetail(ticketId: string): UseTicketDetailResult {
  const { upsertTicket, getTicket } = useTicketStore()
  const { messages: storeMessages, setMessages } = useMessageStore()
  const router = useRouter()
  const profile = useUserStore((state) => state.profile)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activities, setActivities] = useState<ActivityWithActor[]>([])

  const fetchCounter = useRef(0)

  const fetchDetails = useCallback(async () => {
    const currentFetchId = ++fetchCounter.current
    setLoading(true)
    setError(null)

    try {
      // 1. Fetch Ticket details
      const ticketPromise = supabase
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
            customer:customer_id (id, name, email, metadata),
            assigned_user:assigned_to (id, name, email, role)
          `
        )
        .eq("id", ticketId)
        .single()

      // 2. Fetch Messages
      const messagesPromise = supabase
        .from("message")
        .select(
          `
            id,
            ticket_id,
            sender_type,
            sender_id,
            content,
            is_internal,
            created_at,
            sender:sender_id (id, name)
          `
        )
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true })

      // 3. Fetch Activity Log
      const activitiesPromise = supabase
        .from("ticket_activity")
        .select(
          `
            id,
            ticket_id,
            actor_id,
            action,
            previous_value,
            new_value,
            created_at,
            actor:actor_id (id, name)
          `
        )
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: false })

      const [ticketRes, messagesRes, activitiesRes] = await Promise.all([
        withTimeout(Promise.resolve(ticketPromise), 15000),
        withTimeout(Promise.resolve(messagesPromise), 15000),
        withTimeout(Promise.resolve(activitiesPromise), 15000),
      ])

      if (ticketRes.error) throw ticketRes.error
      if (messagesRes.error) throw messagesRes.error
      if (activitiesRes.error) throw activitiesRes.error

      if (currentFetchId === fetchCounter.current) {
        // Upsert ticket to store
        upsertTicket(ticketRes.data as any)

        // Map messages to include sender names if available
        const mappedMessages: MessageWithStatus[] = (messagesRes.data || []).map((m: any) => ({
          id: m.id,
          ticket_id: m.ticket_id,
          sender_type: m.sender_type,
          sender_id: m.sender_id,
          content: m.content,
          is_internal: m.is_internal,
          created_at: m.created_at,
          sender_name: m.sender?.name,
          status: "sent",
        }))

        setMessages(ticketId, mappedMessages)
        setActivities((activitiesRes.data || []) as any)
      }
    } catch (err: any) {
      if (err?.code === "PGRST116") {
        console.warn("[useTicketDetail] Ticket is no longer accessible (RLS).")
      } else {
        console.error("[useTicketDetail] Fetch error:", err)
      }
      if (currentFetchId === fetchCounter.current) {
        let msg = "Failed to load ticket details."
        if (err && typeof err === "object") {
          if (err.code === "PGRST116") {
            const existingTicket = getTicket(ticketId)
            if (existingTicket && profile?.role === "agent") {
              toast.warning("You no longer have access to this ticket.")
              router.push("/inbox")
              return
            }
            msg = "Ticket not found or you do not have permission to view it."
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
  }, [ticketId, upsertTicket, setMessages, getTicket, profile, router])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const ticket = getTicket(ticketId)
  const messages = storeMessages[ticketId] || []

  return {
    ticket,
    messages,
    activities,
    loading,
    error,
    refetch: fetchDetails,
  }
}
