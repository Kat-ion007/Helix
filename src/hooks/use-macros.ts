"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/browser"
import { withTimeout } from "@/lib/supabase/query"
import { Macro } from "@/types"

export function useMacros() {
  const [macros, setMacros] = useState<Macro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMacros() {
      try {
        const { data, error: fetchError } = await withTimeout(
          Promise.resolve(supabase
            .from("macro")
            .select("id, name, content, created_at")
            .order("name", { ascending: true })),
          15000
        )

        if (fetchError) throw fetchError
        setMacros(data || [])
      } catch (err: any) {
        console.error("[useMacros] Error loading reply macros:", err)
        setError(err?.message || "Failed to load macros.")
      } finally {
        setLoading(false)
      }
    }
    loadMacros()
  }, [])

  return {
    macros,
    loading,
    error,
  }
}
