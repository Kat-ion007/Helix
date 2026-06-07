"use client"

import { useState } from "react"
import { useEscalateTicket } from "@/hooks/use-escalate-ticket"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import type { TicketWithDetails } from "@/store/ticket-store"
import type { User } from "@/types"
import { AlertTriangle, ArrowUpRight } from "lucide-react"

interface EscalationModalProps {
  isOpen: boolean
  ticket: TicketWithDetails
  agents: User[]
  onClose: () => void
  onSuccess: () => void
}

export function EscalationModal({
  isOpen,
  ticket,
  agents,
  onClose,
  onSuccess,
}: EscalationModalProps) {
  const [toUserId, setToUserId] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { escalate, isSubmitting } = useEscalateTicket()

  const handleSubmit = async () => {
    if (!toUserId) {
      setError("Please select a target agent or manager.")
      return
    }
    setError(null)

    try {
      await escalate(ticket.id, toUserId, reason)
      onSuccess()
      onClose()
    } catch (err) {
      setError("Escalation failed. Please check details and try again.")
      console.error("[EscalationModal] Error:", err)
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="escalation-title">
      <Modal.Header>
        <div className="flex items-center gap-1.5 text-accent">
          <ArrowUpRight size={18} />
          <h2 id="escalation-title" className="text-sm font-semibold uppercase tracking-wider text-text-primary">
            Escalate Ticket
          </h2>
        </div>
        <Modal.CloseButton />
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col gap-4">
          {/* Read Only Ticket Context */}
          <div className="bg-surface p-3 rounded-lg border border-border/80">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider select-none">
              Ticket Context
            </span>
            <p className="text-sm font-semibold text-text-primary mt-1 leading-snug">
              {ticket.title}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Customer: {ticket.customer?.name || "No Customer Context"}
            </p>
          </div>

          {/* Select Target */}
          <div>
            <label
              htmlFor="escalate-target-select"
              className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 select-none"
            >
              Escalate to: <span className="text-danger">*</span>
            </label>
            <select
              id="escalate-target-select"
              value={toUserId}
              onChange={(e) => {
                setToUserId(e.target.value)
                setError(null)
              }}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select agent or lead...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-xs flex items-center gap-1.5 animate-in fade-in duration-200" role="alert">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <label
              htmlFor="escalate-reason-textarea"
              className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 select-none"
            >
              Reason / Notes (optional):
            </label>
            <textarea
              id="escalate-reason-textarea"
              rows={3}
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide context for the escalation receiver..."
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!toUserId || isSubmitting}
          isLoading={isSubmitting}
        >
          Confirm Escalation
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
