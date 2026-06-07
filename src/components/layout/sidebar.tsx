"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUserStore } from "@/store/user-store"
import { Inbox, LayoutDashboard, Settings } from "lucide-react"

interface SidebarProps {
  onCloseMobileDrawer?: () => void
}

export function Sidebar({ onCloseMobileDrawer }: SidebarProps) {
  const pathname = usePathname()
  const profile = useUserStore((state) => state.profile)

  const navItems = [
    {
      label: "Ticket Inbox",
      href: "/inbox",
      icon: Inbox,
      roles: ["agent", "lead", "admin"],
    },
    {
      label: "Manager Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["lead", "admin"],
    },
    {
      label: "System Settings",
      href: "/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ]

  const allowedNavItems = navItems.filter(
    (item) => profile && item.roles.includes(profile.role)
  )

  return (
    <aside className="w-64 bg-surface-raised border-r border-border/80 flex flex-col h-full shrink-0">
      {/* Brand logo & header */}
      <div className="h-16 flex items-center px-6 border-b border-border/50 gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center font-bold text-sm text-text-primary">
          H
        </div>
        <span className="text-sm font-semibold tracking-tight text-text-primary">
          Helix Support
        </span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent uppercase tracking-wide border border-accent/25">
          v1.0
        </span>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5" aria-label="Main Navigation">
        {allowedNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobileDrawer}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group focus-visible:ring-2 focus-visible:ring-accent outline-none ${
                isActive
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay/80 border border-transparent"
              }`}
            >
              <Icon
                className={`h-4.5 w-4.5 shrink-0 ${
                  isActive ? "text-accent" : "text-text-secondary group-hover:text-text-primary"
                }`}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer / User Profile badge */}
      {profile && (
        <div className="p-4 border-t border-border/50 bg-surface/30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-accent/15 flex items-center justify-center text-accent text-sm font-bold border border-accent/20 uppercase">
              {profile.name.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{profile.name}</p>
              <p className="text-xs text-text-secondary capitalize truncate">{profile.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
