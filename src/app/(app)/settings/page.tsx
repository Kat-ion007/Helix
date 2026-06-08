"use client"

export const dynamic = "force-dynamic"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/user-store"
import { useManageUsers } from "@/hooks/use-manage-users"
import { UserManagementTable } from "@/components/settings/user-management-table"
import { Settings, RefreshCw } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const profile = useUserStore((state) => state.profile)
  const { users, loading, error, refetch, updateUserRole, anonymiseUser } =
    useManageUsers()

  // Admin-only guard — redirect non-admins
  useEffect(() => {
    if (profile && profile.role !== "admin") {
      router.push("/inbox")
    }
  }, [profile, router])

  // Don't render until we know the user is admin
  if (!profile || profile.role !== "admin") {
    return null
  }

  return (
    <div className="flex flex-col flex-1 p-6 max-w-7xl mx-auto w-full gap-6 animate-in fade-in duration-200 select-none">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight md:text-2xl flex items-center gap-2">
            <Settings className="text-accent" />
            <span>System Settings</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Manage user accounts and role assignments.
          </p>
        </div>

        <button
          onClick={refetch}
          className="p-2 rounded-lg bg-surface-raised border border-border/80 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
          aria-label="Refresh user data"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Section heading */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">
          User Management
        </h3>
        <p className="text-xs text-text-secondary">
          Change roles or remove users. Removing a user anonymises their profile
          to preserve ticket history.
        </p>
      </div>

      {/* User Table */}
      <UserManagementTable
        users={users}
        loading={loading}
        error={error}
        onRetry={refetch}
        onUpdateRole={updateUserRole}
        onAnonymise={anonymiseUser}
      />
    </div>
  )
}
