"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = "force-dynamic"

import { useState, use } from "react"
import { useTicketDetail } from "@/hooks/use-ticket-detail"
import { useSendMessage } from "@/hooks/use-send-message"
import { useUpdateTicket } from "@/hooks/use-update-ticket"
import { useAgents } from "@/hooks/use-agents"
import { useTicketDetailRealtime } from "@/lib/realtime/use-ticket-detail-realtime"
import { useKeyboardShortcuts } from "@/lib/shortcuts/use-keyboard-shortcuts"
import { TicketDetailHeader } from "@/components/tickets/ticket-detail-header"
import { ConversationThread } from "@/components/tickets/conversation-thread"
import { ReplyBox } from "@/components/tickets/reply-box"
import { CustomerContextPanel } from "@/components/tickets/customer-context-panel"
import { EscalationModal } from "@/components/escalation/escalation-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TicketDetailPage({ params }: PageProps) {
  // Unwrap params using React.use()
  const { id: ticketId } = use(params)

  const { ticket, messages, loading, error, refetch } = useTicketDetail(ticketId)
  const { sendMessage, retryMessage } = useSendMessage()
  const { updateTicket, updating } = useUpdateTicket()
  const { agents } = useAgents()

  const [isEscalateOpen, setIsEscalateOpen] = useState(false)

  // 1. Setup Live Realtime Subscription (Syncs updates/messages)
  useTicketDetailRealtime(ticketId, refetch)

  // 2. Setup Keyboard Shortcuts
  useKeyboardShortcuts({
    e: () => {
      if (ticket && ticket.status !== "resolved") {
        setIsEscalateOpen(true)
      }
    },
    c: () => {
      if (ticket && ticket.status !== "resolved") {
        updateTicket(ticketId, { status: "resolved" })
      }
    },
  })

  const handleUpdateTicket = async (updates: any) => {
    await updateTicket(ticketId, updates)
  }

  const handleSendMessage = async (content: string, isInternal: boolean) => {
    await sendMessage(ticketId, content, isInternal)
  }

  const handleRetrySendMessage = async (tempId: string, content: string, isInternal: boolean) => {
    await retryMessage(ticketId, tempId, content, isInternal)
  }

  if (loading && !ticket) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-surface w-full divide-x divide-border/40">
        <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6">
          <Skeleton variant="row" />
          <Skeleton variant="paragraph" className="flex-1" />
        </div>
        <div className="w-72 hidden xl:block p-6">
          <Skeleton variant="card" />
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <ErrorState message={error || "Ticket not found."} onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden select-none">
      {/* Left Columns: Conversation Thread & Actions */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header bar */}
        <TicketDetailHeader
          ticket={ticket}
          onUpdateTicket={handleUpdateTicket}
          onEscalateClick={() => setIsEscalateOpen(true)}
          isUpdating={updating}
        />

        {/* Scrollable Conversation Thread */}
        <ConversationThread messages={messages} onRetry={handleRetrySendMessage} />

        {/* Input Reply Box pinned at bottom */}
        {ticket.status !== "resolved" && (
          <ReplyBox onSendMessage={handleSendMessage} disabled={updating} />
        )}
      </div>

      {/* Right Column: Customer Context Panel (collapsible/hidden under 1280px / xl) */}
      <div className="hidden xl:flex h-full border-l border-border/80">
        <CustomerContextPanel customer={ticket.customer as any} />
      </div>

      {/* Escalation Flow Modal */}
      {isEscalateOpen && (
        <EscalationModal
          isOpen={isEscalateOpen}
          ticket={ticket}
          agents={agents}
          onClose={() => setIsEscalateOpen(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  )
}
