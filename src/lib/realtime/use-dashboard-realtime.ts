"use client"

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase/browser"

export function useDashboardRealtime(onReloadMetrics: () => void) {
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleTicketChange = () => {
      // Debounce the refresh to prevent spamming when bulk operations occur
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      debounceTimer.current = setTimeout(() => {
        console.info("[Realtime] Ticket updates detected, refetching dashboard views...")
        onReloadMetrics()
      }, 300)
    }

    const channel = supabase
      .channel("dashboard:metrics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ticket" },
        handleTicketChange
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [onReloadMetrics])
}
