"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase/browser"
import { withTimeout } from "@/lib/supabase/query"
import { useTicketStore } from "@/store/ticket-store"
import { useRealtimeStore } from "@/store/realtime-store"
import { toast } from "@/store/toast-store"
import { Ticket } from "@/types"

interface RealtimePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: Ticket
  old: Partial<Ticket>
}

export function useInboxRealtime(onRefetchNeeded: () => void) {
  const { upsertTicket, removeTicket } = useTicketStore()
  const setStatus = useRealtimeStore((state) => state.setStatus)

  const processedEvents = useRef<Set<string>>(new Set())
  const wasDisconnected = useRef(false)

  // Clean up processed event set periodically to avoid memory leaks
  useEffect(() => {
    const interval = setInterval(() => {
      processedEvents.current.clear()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Helper to fetch details of a specific ticket to merge relations (customer/user)
    const fetchAndUpsertDetails = async (ticketId: string) => {
      try {
        const { data, error } = await withTimeout(
          Promise.resolve(supabase
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
              `
            )
            .eq("id", ticketId)
            .single()),
          15000
        )

        if (error) throw error

        if (data) {
          upsertTicket(data as any)
        }
      } catch (err) {
        console.error("[useInboxRealtime] Failed to fetch updated ticket details:", err)
      }
    }

    const channel = supabase
      .channel("tickets:inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ticket" },
        (payload: any) => {
          const typedPayload = payload as RealtimePayload
          const eventType = typedPayload.eventType
          const ticketId = eventType === "DELETE" ? typedPayload.old.id : typedPayload.new.id
          
          if (!ticketId) return

          // Deduplication check: key is ID + updated_at
          const updatedAt = eventType === "DELETE" ? Date.now().toString() : typedPayload.new.updated_at
          const dedupKey = `${ticketId}-${updatedAt}`
          
          if (processedEvents.current.has(dedupKey)) return
          processedEvents.current.add(dedupKey)

          console.info(`[Realtime] Received ticket ${eventType}:`, ticketId)

          if (eventType === "DELETE") {
            removeTicket(ticketId)
            // Announce to live region for screen readers
            const liveRegion = document.getElementById("announcement-region")
            if (liveRegion) {
              liveRegion.textContent = `Ticket was deleted.`
            }
          } else {
            // INSERT or UPDATE: fetch fully joined columns in background, then upsert
            fetchAndUpsertDetails(ticketId)
            
            // Announce status update to screen readers
            const liveRegion = document.getElementById("announcement-region")
            if (liveRegion && typedPayload.new.title) {
              liveRegion.textContent = `Ticket #${ticketId.substring(0, 6)} was updated: ${typedPayload.new.status}`
            }
          }
        }
      )
      .subscribe((status: any) => {
        if (status === "SUBSCRIBED") {
          console.info("[Realtime] tickets:inbox connected")
          setStatus("connected")
          
          if (wasDisconnected.current) {
            wasDisconnected.current = false
            toast.success("Connection restored. Refreshing ticket list...")
            onRefetchNeeded()
          }
        } else if (status === "CHANNEL_ERROR") {
          console.error("[Realtime] tickets:inbox channel error")
          setStatus("error")
          wasDisconnected.current = true
        } else if (status === "TIMED_OUT") {
          console.warn("[Realtime] tickets:inbox channel timed out")
          setStatus("reconnecting")
          wasDisconnected.current = true
        } else if (status === "CLOSED") {
          console.info("[Realtime] tickets:inbox channel closed")
          setStatus("disconnected")
          wasDisconnected.current = true
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [upsertTicket, removeTicket, setStatus, onRefetchNeeded])
}
