"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/browser"
import { withTimeout } from "@/lib/supabase/query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { formatSLADue, isSLABreached, isSLAWarning } from "@/utils/sla"
import type { TicketWithDetails } from "@/store/ticket-store"
import { ArrowLeft, UserCheck, CheckCircle2, ArrowUpRight, Clock } from "lucide-react"
import Link from "next/link"
import { useUserStore } from "@/store/user-store"

interface TicketDetailHeaderProps {
  ticket: TicketWithDetails
  onUpdateTicket: (updates: { status?: any; priority?: any; assigned_to?: string | null }) => Promise<void>
  onEscalateClick: () => void
  isUpdating?: boolean
}

interface Agent {
  id: string
  name: string
  role: string
}

export function TicketDetailHeader({
  ticket,
  onUpdateTicket,
  onEscalateClick,
  isUpdating = false,
}: TicketDetailHeaderProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(ticket.assigned_to)

  const { profile } = useUserStore()
  const canUpdate =
    profile?.role !== "agent" ||
    ticket.assigned_to === profile.id ||
    (ticket.assigned_to === null && ticket.status === "open")

  const slaBreached = isSLABreached(ticket.sla_due)
  const slaWarning = isSLAWarning(ticket.sla_due)

  useEffect(() => {
    async function loadAgents() {
      try {
        const { data } = await withTimeout(
          Promise.resolve(supabase
            .from("user")
            .select("id, name, role")
            .order("name", { ascending: true })),
          15000
        )
        setAgents(data || [])
      } catch (err) {
        console.error("[TicketDetailHeader] Failed to load agents:", err)
      }
    }
    loadAgents()
  }, [])

  const handleAssignSubmit = async () => {
    try {
      await onUpdateTicket({ assigned_to: selectedAgentId === "unassigned" ? null : selectedAgentId })
      setShowAssignModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCloseTicketSubmit = async () => {
    try {
      await onUpdateTicket({ status: "resolved" })
      setShowCloseModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-surface-raised border-b border-border/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
      {/* Left side: Back to Inbox & Title / Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/inbox"
            className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-overlay focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
            aria-label="Back to ticket inbox"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-semibold text-mono">
              #{ticket.id.substring(0, 8)}
            </span>
            <Badge status={ticket.status} />
            <Badge priority={ticket.priority} />
          </div>
        </div>

        <h2 className="text-base font-bold text-text-primary truncate mb-1" title={ticket.title}>
          {ticket.title}
        </h2>

        {/* SLA due time */}
        <div
          className={`flex items-center gap-1.5 text-xs font-semibold ${
            slaBreached ? "text-danger" : slaWarning ? "text-warning" : "text-text-secondary"
          }`}
        >
          <Clock size={13} />
          <span>SLA Countdown:</span>
          <span className="text-mono">{formatSLADue(ticket.sla_due)}</span>
        </div>
      </div>

      {/* Right side: Control buttons */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {/* Assign button */}
        <Button
          variant="secondary"
          onClick={() => {
            if (!canUpdate) return
            setSelectedAgentId(ticket.assigned_to)
            setShowAssignModal(true)
          }}
          disabled={isUpdating || !canUpdate}
          className="gap-1.5 cursor-pointer text-xs uppercase tracking-wider font-semibold"
        >
          <UserCheck size={14} />
          <span>
            {ticket.assigned_user ? `Assigned: ${ticket.assigned_user.name}` : "Assign Ticket"}
          </span>
        </Button>

        {/* Escalate button */}
        {ticket.status !== "resolved" && (
          <Button
            variant="secondary"
            onClick={() => {
              if (canUpdate) onEscalateClick()
            }}
            disabled={isUpdating || !canUpdate}
            className="gap-1.5 cursor-pointer text-xs uppercase tracking-wider font-semibold"
          >
            <ArrowUpRight size={14} />
            <span>Escalate</span>
          </Button>
        )}

        {/* Close/Resolve button */}
        {ticket.status !== "resolved" && (
          <Button
            variant="primary"
            onClick={() => {
              if (canUpdate) setShowCloseModal(true)
            }}
            disabled={isUpdating || !canUpdate}
            className="gap-1.5 cursor-pointer text-xs uppercase tracking-wider font-semibold"
          >
            <CheckCircle2 size={14} />
            <span>Close Ticket</span>
          </Button>
        )}
      </div>

      {/* Assignment Modal */}
      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)} aria-labelledby="assign-title">
        <Modal.Header>
          <h2 id="assign-title" className="text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5 text-text-primary">
            <UserCheck size={16} className="text-accent" />
            Assign Ticket
          </h2>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <label htmlFor="assignee-select" className="block text-xs text-text-secondary font-semibold uppercase tracking-wider mb-2">
            Select Assigned Agent:
          </label>
          <select
            id="assignee-select"
            value={selectedAgentId || "unassigned"}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="unassigned">Unassigned</option>
            {agents
              .filter((a) => {
                if (profile?.role === "agent") {
                  return a.role === "agent"
                }
                return true
              })
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setShowAssignModal(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssignSubmit} isLoading={isUpdating}>
            Confirm Assignment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Close Ticket Confirmation Modal */}
      <Modal open={showCloseModal} onClose={() => setShowCloseModal(false)} aria-labelledby="close-title">
        <Modal.Header>
          <h2 id="close-title" className="text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5 text-text-primary">
            <CheckCircle2 size={16} className="text-success" />
            Close Ticket
          </h2>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to close this ticket? This will set its status to{" "}
          <span className="font-semibold text-success">Resolved</span>.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setShowCloseModal(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCloseTicketSubmit} isLoading={isUpdating}>
            Close Ticket
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
