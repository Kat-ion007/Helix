"use client"
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/browser"
import { withTimeout } from "@/lib/supabase/query"
import { toast } from "@/store/toast-store"
import { User, UserRole, UserStatus } from "@/types"

export function useManageUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

      try {
        const { data, error: fetchError } = await withTimeout(
          Promise.resolve(supabase
            .from("user")
            .select("id, name, email, role, status, created_at")
            .order("name", { ascending: true })),
          15000
        )

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

  const createUser = async (userData: {
    name: string
    email: string
    role: UserRole
  }): Promise<void> => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send invitation")

      toast.success("Invitation sent successfully.")
      await fetchUsers()
    } catch (err: any) {
      console.error("[useManageUsers] Send invitation failed:", err)
      toast.error(err.message || "Failed to send invitation.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateUserDetails = async (userData: {
    id: string
    name?: string
    email?: string
    role?: UserRole
    status?: UserStatus
  }): Promise<void> => {
    // 1. Snapshot for rollback
    const previous = users.find((u) => u.id === userData.id)
    if (!previous) return

    // 2. Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === userData.id ? { ...u, ...userData } : u))
    )

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update user")

      toast.success("User updated successfully.")
      await fetchUsers()
    } catch (err: any) {
      // Rollback
      setUsers((prev) =>
        prev.map((u) => (u.id === userData.id ? previous : u))
      )
      console.error("[useManageUsers] Update user failed:", err)
      toast.error(err.message || "Failed to update user.")
      throw err
    }
  }

  const anonymiseUser = async (userId: string): Promise<void> => {
    // 1. Snapshot for rollback
    const previous = users.find((u) => u.id === userId)
    if (!previous) return

    // 2. Optimistic remove from list
    setUsers((prev) => prev.filter((u) => u.id !== userId))

    try {
      const { error: updateError } = await withTimeout(
        Promise.resolve(supabase
          .from("user")
          .update({
            name: "[deleted]",
            email: `deleted-${userId.substring(0, 8)}@helix.local`,
          })
          .eq("id", userId)),
        15000
      )

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
    createUser,
    updateUserDetails,
    anonymiseUser,
  }
}
