"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTickets } from "@/hooks/use-tickets"
import { useInboxRealtime } from "@/lib/realtime/use-inbox-realtime"
import { useKeyboardShortcuts } from "@/lib/shortcuts/use-keyboard-shortcuts"
import { TicketFilters } from "@/components/tickets/ticket-filters"
import { TicketList } from "@/components/tickets/ticket-list"
import { BulkActionsBar } from "@/components/tickets/bulk-actions-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Inbox as InboxIcon, RefreshCw } from "lucide-react"

export default function InboxPage() {
  const router = useRouter()
  const { tickets, loading, error, refetch, totalCount, page, setPage } = useTickets()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Setup Realtime Inbox Updates (subscribes to insert/update/delete)
  useInboxRealtime(refetch)

  // Keyboard Shortcuts: Pressing '/' focuses the search input
  useKeyboardShortcuts({
    "/": () => {
      const searchInput = document.querySelector('input[placeholder*="Search tickets"]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
        searchInput.select()
      }
    },
  }, isMobile)

  const handleOpenTicket = (id: string) => {
    router.push(`/tickets/${id}`)
  }

  // Calculate pagination variables
  const totalPages = Math.ceil(totalCount / 25)

  return (
    <div className="flex flex-col flex-1 p-6 max-w-7xl mx-auto w-full gap-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight md:text-2xl">
            Ticket Inbox
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            {totalCount} ticket{totalCount !== 1 ? "s" : ""} matching filters
          </p>
        </div>

        <button
          onClick={refetch}
          className="p-2 rounded-lg bg-surface-raised border border-border/80 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          aria-label="Refresh tickets"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <TicketFilters />

      {/* Main List / State Display */}
      {loading && tickets.length === 0 ? (
        <div className="space-y-3">
          <Skeleton variant="row" />
          <Skeleton variant="row" />
          <Skeleton variant="row" />
          <Skeleton variant="row" />
          <Skeleton variant="row" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={<InboxIcon size={48} className="text-text-muted" />}
          heading="No tickets found"
          subtext="No tickets match your filters, or the inbox is completely clear."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <TicketList tickets={tickets} onOpenTicket={handleOpenTicket} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-xs text-text-secondary font-medium">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 text-xs font-semibold bg-surface-raised border border-border rounded-lg text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 text-xs font-semibold bg-surface-raised border border-border rounded-lg text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk actions overlay bar (rendered when tickets are selected) */}
      <BulkActionsBar onActionCompleted={refetch} />
    </div>
  )
}
