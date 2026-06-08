"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/browser"
import { EscalationStatus } from "@/types"

export interface EscalationRecord {
  id: string
  ticket_id: string
  from_user: string
  to_user: string
  reason: string | null
  status: EscalationStatus
  created_at: string
  ticket: {
    id: string
    title: string
    status: string
  } | null
  from: {
    id: string
    name: string
    role: string
  } | null
  to: {
    id: string
    name: string
    role: string
  } | null
}

export function useEscalations() {
  const [escalations, setEscalations] = useState<EscalationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEscalations = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("escalation")
        .select(
          `
          id,
          ticket_id,
          from_user,
          to_user,
          reason,
          status,
          created_at,
          ticket:ticket_id (id, title, status),
          from:from_user (id, name, role),
          to:to_user (id, name, role)
        `
        )
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setEscalations((data as unknown as EscalationRecord[]) || [])
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load escalation history."
      console.error("[useEscalations] Error:", err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEscalations()
  }, [fetchEscalations])

  return {
    escalations,
    loading,
    error,
    refetch: fetchEscalations,
  }
}
