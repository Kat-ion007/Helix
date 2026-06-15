"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/browser"
import { withTimeout } from "@/lib/supabase/query"
import { User } from "@/types"

export function useAgents() {
  const [agents, setAgents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAgents() {
      try {
        const { data, error: fetchError } = await withTimeout(
          Promise.resolve(supabase
            .from("user")
            .select("id, name, email, role, created_at")
            .order("name", { ascending: true })),
          15000
        )

        if (fetchError) throw fetchError
        setAgents((data || []) as User[])
      } catch (err: any) {
        console.error("[useAgents] Error loading agents list:", err)
        setError(err?.message || "Failed to load agents.")
      } finally {
        setLoading(false)
      }
    }
    loadAgents()
  }, [])

  return {
    agents,
    loading,
    error,
  }
}
