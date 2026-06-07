"use client"

import { useRealtimeStore } from "@/store/realtime-store"
import { WifiOff, Loader2 } from "lucide-react"

export function RealtimeStatusBanner() {
  const status = useRealtimeStore((state) => state.status)

  if (status === "connected") return null

  const labelMap = {
    reconnecting: "Reconnecting to live service...",
    error: "Connection lost. Live updates paused.",
    disconnected: "Disconnected. Live updates paused.",
  }

  return (
    <div
      className="bg-warning/10 border-b border-warning/20 text-warning px-4 py-2 text-xs flex items-center justify-center gap-2 font-medium w-full animate-in slide-in-from-top duration-200"
      role="status"
      aria-live="polite"
    >
      {status === "reconnecting" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <WifiOff className="h-3.5 w-3.5" />
      )}
      <span>{labelMap[status] || "Live updates paused."}</span>
    </div>
  )
}
