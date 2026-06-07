"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/browser"
import { useUserStore } from "@/store/user-store"
import { Avatar } from "@/components/ui/avatar"
import { LogOut, Menu } from "lucide-react"

interface TopNavProps {
  onOpenMobileDrawer: () => void
}

export function TopNav({ onOpenMobileDrawer }: TopNavProps) {
  const router = useRouter()
  const profile = useUserStore((state) => state.profile)

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push("/login")
      router.refresh()
    } catch (err) {
      console.error("[TopNav] Logout failed:", err)
    }
  }

  return (
    <header className="h-16 bg-surface-raised border-b border-border/80 px-6 flex items-center justify-between sticky top-0 z-sticky backdrop-blur-md">
      {/* Left side: mobile toggle & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileDrawer}
          className="md:hidden text-text-secondary hover:text-text-primary p-1 rounded hover:bg-surface-overlay focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold text-text-primary tracking-tight md:text-base">
          Helix Workspace
        </h1>
      </div>

      {/* Right side: user menu & logout */}
      <div className="flex items-center gap-4">
        {profile && (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent uppercase tracking-wide">
              {profile.role}
            </span>
            <Avatar name={profile.name} size="sm" />
          </div>
        )}

        <button
          onClick={handleLogout}
          className="text-text-secondary hover:text-danger p-2 rounded-lg hover:bg-danger/10 transition-colors focus:outline-none focus:ring-2 focus:ring-danger cursor-pointer flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          aria-label="Log out of Helix"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
