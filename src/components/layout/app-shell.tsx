"use client"

import { useState, ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal"
import { useKeyboardShortcuts } from "@/lib/shortcuts/use-keyboard-shortcuts"
import { RealtimeStatusBanner } from "@/components/ui/realtime-status-banner"
import { ToastContainer } from "@/components/ui/toast"
import { X } from "lucide-react"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const openMobileDrawer = () => setIsMobileOpen(true)
  const closeMobileDrawer = () => setIsMobileOpen(false)

  // Global '?' shortcut to toggle the shortcuts map guide modal
  useKeyboardShortcuts({
    "?": () => setShowShortcuts((prev) => !prev),
  })

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-text-primary">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer (overlay on mobile) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-modal flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={closeMobileDrawer}
          />
          {/* Drawer Content */}
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-surface-raised border-r border-border animate-in slide-in-from-left duration-200">
            {/* Close Button inside drawer header */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={closeMobileDrawer}
                className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-surface-overlay focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar onCloseMobileDrawer={closeMobileDrawer} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopNav onOpenMobileDrawer={openMobileDrawer} onOpenShortcuts={() => setShowShortcuts(true)} />
        
        {/* Realtime Status Banner immediately below nav */}
        <RealtimeStatusBanner />

        {/* Dynamic page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
