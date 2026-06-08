"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/browser"
import { toast } from "@/store/toast-store"
import { User, UserRole } from "@/types"

export function useManageUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("user")
        .select("id, name, email, role, created_at")
        .order("name", { ascending: true })

      if (fetchError) throw fetchError

      setUsers((data as User[]) || [])
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load users."
      console.error("[useManageUsers] Error:", err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const updateUserRole = async (
    userId: string,
    newRole: UserRole
  ): Promise<void> => {
    // 1. Snapshot for rollback
    const previous = users.find((u) => u.id === userId)
    if (!previous) return

    // 2. Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    )

    try {
      const { error: updateError } = await supabase
        .from("user")
        .update({ role: newRole })
        .eq("id", userId)

      if (updateError) throw updateError

      toast.success(`Role updated to ${newRole}.`)
    } catch (err: unknown) {
      // Rollback
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? previous : u))
      )
      console.error("[useManageUsers] Role update failed:", JSON.stringify(err, null, 2), err)
      toast.error("Failed to update role. Please try again.")
    }
  }

  const anonymiseUser = async (userId: string): Promise<void> => {
    // 1. Snapshot for rollback
    const previous = users.find((u) => u.id === userId)
    if (!previous) return

    // 2. Optimistic remove from list
    setUsers((prev) => prev.filter((u) => u.id !== userId))

    try {
      const { error: updateError } = await supabase
        .from("user")
        .update({
          name: "[deleted]",
          email: `deleted-${userId.substring(0, 8)}@helix.local`,
        })
        .eq("id", userId)

      if (updateError) throw updateError

      toast.success("User anonymised successfully.")
    } catch (err: unknown) {
      // Rollback
      setUsers((prev) => [...prev, previous].sort((a, b) => a.name.localeCompare(b.name)))
      console.error("[useManageUsers] Anonymise failed:", JSON.stringify(err, null, 2), err)
      toast.error("Failed to anonymise user. Please try again.")
    }
  }

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    anonymiseUser,
  }
}
