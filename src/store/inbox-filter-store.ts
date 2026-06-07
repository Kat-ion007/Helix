import { create } from "zustand"
import { TicketStatus, TicketPriority } from "@/types"

export type FilterStatus = TicketStatus | "all"
export type FilterPriority = TicketPriority | "all"
export type FilterAssignment = "all" | "unassigned" | string // string represents user ID

interface InboxFilterStore {
  status: FilterStatus
  priority: FilterPriority
  assignedTo: FilterAssignment
  sortBy: "sla_due" | "created_at"
  sortOrder: "asc" | "desc"
  searchQuery: string
  selectedTicketIds: string[]
  page: number
  
  setStatus: (status: FilterStatus) => void
  setPriority: (priority: FilterPriority) => void
  setAssignedTo: (assignedTo: FilterAssignment) => void
  setSortBy: (sortBy: "sla_due" | "created_at") => void
  setSortOrder: (sortOrder: "asc" | "desc") => void
  setSearchQuery: (query: string) => void
  setPage: (page: number) => void
  toggleSelectTicket: (id: string) => void
  setSelectedTickets: (ids: string[]) => void
  clearSelection: () => void
  resetFilters: () => void
}

export const useInboxFilterStore = create<InboxFilterStore>((set) => ({
  status: "all",
  priority: "all",
  assignedTo: "all",
  sortBy: "sla_due",
  sortOrder: "asc",
  searchQuery: "",
  selectedTicketIds: [],
  page: 1,

  setStatus: (status) => set({ status, page: 1, selectedTicketIds: [] }),
  setPriority: (priority) => set({ priority, page: 1, selectedTicketIds: [] }),
  setAssignedTo: (assignedTo) => set({ assignedTo, page: 1, selectedTicketIds: [] }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setSearchQuery: (searchQuery) => set({ searchQuery, page: 1, selectedTicketIds: [] }),
  setPage: (page) => set({ page }),
  
  toggleSelectTicket: (id) =>
    set((state) => {
      const isSelected = state.selectedTicketIds.includes(id)
      const selectedTicketIds = isSelected
        ? state.selectedTicketIds.filter((tId) => tId !== id)
        : [...state.selectedTicketIds, id]
      return { selectedTicketIds }
    }),
    
  setSelectedTickets: (selectedTicketIds) => set({ selectedTicketIds }),
  clearSelection: () => set({ selectedTicketIds: [] }),
  
  resetFilters: () =>
    set({
      status: "all",
      priority: "all",
      assignedTo: "all",
      sortBy: "sla_due",
      sortOrder: "asc",
      searchQuery: "",
      selectedTicketIds: [],
      page: 1,
    }),
}))
