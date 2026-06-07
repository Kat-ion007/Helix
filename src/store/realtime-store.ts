import { create } from "zustand"

export type RealtimeStatus = "connected" | "reconnecting" | "error" | "disconnected"

interface RealtimeStore {
  status: RealtimeStatus
  setStatus: (status: RealtimeStatus) => void
}

export const useRealtimeStore = create<RealtimeStore>((set) => ({
  status: "connected", // Default to connected on load, will update dynamically
  setStatus: (status) => set({ status }),
}))
