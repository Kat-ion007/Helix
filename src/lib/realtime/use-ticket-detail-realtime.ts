"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase/browser"
import { useTicketStore } from "@/store/ticket-store"
import { useMessageStore } from "@/store/message-store"
import { useRealtimeStore } from "@/store/realtime-store"
import { toast } from "@/store/toast-store"

export function useTicketDetailRealtime(ticketId: string, onRefetchNeeded: () => void) {
  const { upsertTicket } = useTicketStore()
  const { appendMessage, removeMessage } = useMessageStore()
  const setStatus = useRealtimeStore((state) => state.setStatus)

  const processedEvents = useRef<Set<string>>(new Set())
  const wasDisconnected = useRef(false)

  useEffect(() => {
    // 1. Fetch updated ticket details when a change occurs to capture joins
    const fetchAndUpsertTicket = async () => {
      try {
        const { data, error } = await (supabase.from("ticket") as any)
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

        if (error) throw error
        if (data) {
          upsertTicket(data as any)
        }
      } catch (err) {
        console.error("[useTicketDetailRealtime] Failed to fetch updated ticket details:", err)
      }
    }

    // 2. Fetch sender name when a message is inserted to display in the conversation bubble
    const fetchAndAppendMessage = async (msgPayload: any) => {
      try {
        let senderName = undefined
        if (msgPayload.sender_type === "agent" && msgPayload.sender_id) {
          const { data } = await (supabase.from("user") as any)
            .select("name")
            .eq("id", msgPayload.sender_id)
            .single()
          senderName = (data as any)?.name
        }

        appendMessage(ticketId, {
          ...msgPayload,
          sender_name: senderName,
          status: "sent",
        })
      } catch (err) {
        console.error("[useTicketDetailRealtime] Failed to process incoming message:", err)
      }
    }

    const channel = supabase
      .channel(`ticket:${ticketId}`)
      // Update ticket events
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ticket",
          filter: `id=eq.${ticketId}`,
        },
        (payload: any) => {
          const dedupKey = `${payload.new.id}-${payload.new.updated_at}`
          if (processedEvents.current.has(dedupKey)) return
          processedEvents.current.add(dedupKey)

          console.info("[Realtime] Ticket detail update:", payload.new.id)
          fetchAndUpsertTicket()
        }
      )
      // New message events
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload: any) => {
          const dedupKey = `${payload.new.id}-${payload.new.created_at}`
          if (processedEvents.current.has(dedupKey)) return
          processedEvents.current.add(dedupKey)

          console.info("[Realtime] Ticket detail new message:", payload.new.id)
          
          // Check if this was a temp message we sent (we already appended it, so we can ignore it
          // or let the select replace it). Since temp messages have a status !== 'sent',
          // they'll get replaced/overridden when we call appendMessage with the actual ID.
          fetchAndAppendMessage(payload.new)
        }
      )
      .subscribe((status: any) => {
        if (status === "SUBSCRIBED") {
          console.info(`[Realtime] ticket:${ticketId} connected`)
          setStatus("connected")
          
          if (wasDisconnected.current) {
            wasDisconnected.current = false
            toast.success("Connection restored. Syncing ticket conversation...")
            onRefetchNeeded()
          }
        } else if (status === "CHANNEL_ERROR") {
          console.error(`[Realtime] ticket:${ticketId} connection error`)
          setStatus("error")
          wasDisconnected.current = true
        } else if (status === "TIMED_OUT") {
          console.warn(`[Realtime] ticket:${ticketId} channel timed out`)
          setStatus("reconnecting")
          wasDisconnected.current = true
        } else if (status === "CLOSED") {
          setStatus("disconnected")
          wasDisconnected.current = true
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, upsertTicket, appendMessage, removeMessage, setStatus, onRefetchNeeded])
}
