"use client"

import { useToastStore, type Toast } from "@/store/toast-store"
import { CheckCircle, AlertCircle, AlertTriangle, X } from "lucide-react"

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <div className="fixed top-4 right-4 z-toast flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}

function ToastItem({ toast: { id, message, type } }: { toast: Toast }) {
  const removeToast = useToastStore((state) => state.removeToast)

  const styles = {
    success: "bg-surface-overlay border-success/30 text-text-primary shadow-lg shadow-success/5",
    error: "bg-surface-overlay border-danger/30 text-text-primary shadow-lg shadow-danger/5",
    warning: "bg-surface-overlay border-warning/30 text-text-primary shadow-lg shadow-warning/5",
  }

  const icons = {
    success: <CheckCircle className="h-4 w-4 text-success shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-danger shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-warning shrink-0" />,
  }

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm pointer-events-auto animate-in slide-in-from-right-5 duration-200 ${styles[type]}`}
      role="status"
    >
      {icons[type]}
      <div className="flex-1 font-medium">{message}</div>
      <button
        onClick={() => removeToast(id)}
        className="text-text-muted hover:text-text-primary focus:outline-none transition-colors p-0.5 rounded hover:bg-surface-raised cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
