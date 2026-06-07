"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/browser"
import { useInboxFilterStore } from "@/store/inbox-filter-store"
import { toast } from "@/store/toast-store"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { TicketStatus } from "@/types"
import { Users, CheckSquare, X, ShieldAlert } from "lucide-react"

interface Agent {
  id: string
  name: string
}

interface BulkActionsBarProps {
  onActionCompleted: () => void
}

export function BulkActionsBar({ onActionCompleted }: BulkActionsBarProps) {
  const { selectedTicketIds, clearSelection } = useInboxFilterStore()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  // Confirmations
  const [confirmStatus, setConfirmStatus] = useState<TicketStatus | null>(null)
  const [confirmAssign, setConfirmAssign] = useState<string | null>(null) // holds agent ID

  useEffect(() => {
    async function loadAgents() {
      try {
        const { data } = await (supabase.from("user") as any)
          .select("id, name")
          .order("name", { ascending: true })
        setAgents(data || [])
      } catch (err) {
        console.error("[BulkActionsBar] Failed to load agents:", err)
      }
    }
    if (selectedTicketIds.length > 0) {
      loadAgents()
    }
  }, [selectedTicketIds.length])

  if (selectedTicketIds.length === 0) return null

  const handleBulkStatusChange = async () => {
    if (!confirmStatus) return
    setIsUpdating(true)

    try {
      const { error } = await (supabase.from("ticket") as any)
        .update({
          status: confirmStatus,
          updated_at: new Date().toISOString(),
        })
        .in("id", selectedTicketIds)

      if (error) throw error

      toast.success(
        `Successfully updated ${selectedTicketIds.length} ticket${
          selectedTicketIds.length > 1 ? "s" : ""
        } to ${confirmStatus}.`
      )
      clearSelection()
      onActionCompleted()
    } catch (err: any) {
      console.error("[BulkActionsBar] Bulk update failed:", err)
      toast.error(err?.message || "Failed to update tickets. Please try again.")
    } finally {
      setIsUpdating(false)
      setConfirmStatus(null)
    }
  }

  const handleBulkAssign = async () => {
    if (!confirmAssign) return
    setIsUpdating(true)

    const selectedAgent = agents.find((a) => a.id === confirmAssign)

    try {
      const { error } = await (supabase.from("ticket") as any)
        .update({
          assigned_to: confirmAssign === "unassigned" ? null : confirmAssign,
          updated_at: new Date().toISOString(),
        })
        .in("id", selectedTicketIds)

      if (error) throw error

      toast.success(
        `Assigned ${selectedTicketIds.length} ticket${
          selectedTicketIds.length > 1 ? "s" : ""
        } to ${confirmAssign === "unassigned" ? "Unassigned" : selectedAgent?.name || ""}.`
      )
      clearSelection()
      onActionCompleted()
    } catch (err: any) {
      console.error("[BulkActionsBar] Bulk assignment failed:", err)
      toast.error(err?.message || "Failed to assign tickets. Please try again.")
    } finally {
      setIsUpdating(false)
      setConfirmAssign(null)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-sticky bg-surface-overlay border border-accent/30 rounded-xl px-5 py-3 shadow-2xl flex items-center gap-6 max-w-2xl w-[calc(100%-2rem)] sm:w-auto animate-in slide-in-from-bottom-5 duration-200">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
            {selectedTicketIds.length} ticket{selectedTicketIds.length > 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="h-4 w-px bg-border/80 hidden sm:block" />

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status update buttons */}
          <select
            aria-label="Bulk Update Status"
            value=""
            onChange={(e) => setConfirmStatus(e.target.value as TicketStatus)}
            className="bg-surface/60 hover:bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
          >
            <option value="" disabled>
              Update Status...
            </option>
            <option value="open">Mark Open</option>
            <option value="pending">Mark Pending</option>
            <option value="resolved">Mark Resolved</option>
          </select>

          {/* Assignment dropdown */}
          <select
            aria-label="Bulk Assign Agent"
            value=""
            onChange={(e) => setConfirmAssign(e.target.value)}
            className="bg-surface/60 hover:bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
          >
            <option value="" disabled>
              Assign Agent...
            </option>
            <option value="unassigned">Unassign</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <Button
            variant="ghost"
            onClick={clearSelection}
            size="sm"
            className="text-text-muted hover:text-text-primary cursor-pointer"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Modal - Bulk Status Change */}
      <Modal open={!!confirmStatus} onClose={() => setConfirmStatus(null)} aria-labelledby="bulk-status-title">
        <Modal.Header>
          <div className="flex items-center gap-2 text-warning">
            <ShieldAlert size={20} />
            <h2 id="bulk-status-title" className="text-sm font-semibold uppercase tracking-wider">
              Confirm Bulk Status Update
            </h2>
          </div>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to update <span className="font-semibold text-accent">{selectedTicketIds.length}</span>{" "}
          ticket{selectedTicketIds.length > 1 ? "s" : ""} to status{" "}
          <span className="font-semibold capitalize text-text-primary">{confirmStatus}</span>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setConfirmStatus(null)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBulkStatusChange} isLoading={isUpdating}>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal - Bulk Assignment */}
      <Modal open={!!confirmAssign} onClose={() => setConfirmAssign(null)} aria-labelledby="bulk-assign-title">
        <Modal.Header>
          <div className="flex items-center gap-2 text-warning">
            <Users size={20} />
            <h2 id="bulk-assign-title" className="text-sm font-semibold uppercase tracking-wider">
              Confirm Bulk Assignment
            </h2>
          </div>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to assign <span className="font-semibold text-accent">{selectedTicketIds.length}</span>{" "}
          ticket{selectedTicketIds.length > 1 ? "s" : ""} to{" "}
          <span className="font-semibold text-text-primary">
            {confirmAssign === "unassigned" ? "Unassigned" : agents.find((a) => a.id === confirmAssign)?.name || ""}
          </span>
          ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setConfirmAssign(null)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBulkAssign} isLoading={isUpdating}>
            Assign Tickets
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
