import { create } from "zustand"
import { Ticket, Customer, User } from "@/types"

export interface TicketWithDetails extends Ticket {
  customer?: Customer | null
  assigned_user?: User | null
}

interface TicketStore {
  tickets: Record<string, TicketWithDetails>
  setTickets: (tickets: TicketWithDetails[]) => void
  upsertTicket: (ticket: TicketWithDetails) => void
  removeTicket: (id: string) => void
  getTicket: (id: string) => TicketWithDetails | undefined
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: {},
  setTickets: (ticketList) => {
    const ticketRecord: Record<string, TicketWithDetails> = {}
    ticketList.forEach((t) => {
      ticketRecord[t.id] = t
    })
    set({ tickets: ticketRecord })
  },
  upsertTicket: (newTicket) => {
    set((state) => {
      const existing = state.tickets[newTicket.id]

      if (existing) {
        // Realtime conflict resolution: compare updated_at timestamps
        const existingTime = new Date(existing.updated_at).getTime()
        const newTime = new Date(newTicket.updated_at).getTime()

        if (existingTime > newTime) {
          // Keep the existing (newer) ticket state
          return state
        }
      }

      // Otherwise, update or insert the ticket
      return {
        tickets: {
          ...state.tickets,
          [newTicket.id]: {
            ...existing,
            ...newTicket,
          },
        },
      }
    })
  },
  removeTicket: (id) => {
    set((state) => {
      const nextTickets = { ...state.tickets }
      delete nextTickets[id]
      return { tickets: nextTickets }
    })
  },
  getTicket: (id) => get().tickets[id],
}))
