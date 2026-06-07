"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useRef, useState } from "react"
import { TicketRow } from "./ticket-row"
import type { TicketWithDetails } from "@/store/ticket-store"
import { useInboxFilterStore } from "@/store/inbox-filter-store"

interface TicketListProps {
  tickets: TicketWithDetails[]
  onOpenTicket: (id: string) => void
}

export function TicketList({ tickets, onOpenTicket }: TicketListProps) {
  const { selectedTicketIds, toggleSelectTicket } = useInboxFilterStore()
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reset focus index if list size changes or tickets change
    setFocusedIndex(-1)
  }, [tickets])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut keys if user is typing in input/textarea fields
      const activeEl = document.activeElement
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return
      }

      if (e.key === "j" || e.key === "J") {
        e.preventDefault()
        setFocusedIndex((prev) => {
          const next = prev + 1
          if (next < tickets.length) {
            focusRow(next)
            return next
          }
          return prev
        })
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault()
        setFocusedIndex((prev) => {
          const next = prev - 1
          if (next >= 0) {
            focusRow(next)
            return next
          }
          return prev
        })
      } else if (e.key === "Enter" && focusedIndex >= 0 && focusedIndex < tickets.length) {
        e.preventDefault()
        onOpenTicket(tickets[focusedIndex].id)
      } else if (e.key === "x" || e.key === "X") {
        // Press 'X' to toggle selection on focused ticket
        if (focusedIndex >= 0 && focusedIndex < tickets.length) {
          e.preventDefault()
          toggleSelectTicket(tickets[focusedIndex].id)
        }
      }
    }

    const focusRow = (index: number) => {
      if (!listRef.current) return
      const rows = listRef.current.querySelectorAll('[role="row"]')
      const rowToFocus = rows[index] as HTMLElement
      if (rowToFocus) {
        rowToFocus.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [tickets, focusedIndex, onOpenTicket, toggleSelectTicket])

  return (
    <div
      ref={listRef}
      role="grid"
      aria-label="Ticket List"
      className="flex flex-col rounded-lg border border-border bg-surface-raised overflow-hidden divide-y divide-border/40"
    >
      {tickets.map((ticket) => (
        <TicketRow
          key={ticket.id}
          ticket={ticket}
          isSelected={selectedTicketIds.includes(ticket.id)}
          onSelect={toggleSelectTicket}
          onOpen={onOpenTicket}
        />
      ))}
    </div>
  )
}
