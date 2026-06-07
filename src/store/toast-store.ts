import { create } from "zustand"

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "warning"
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, type: "success" | "error" | "warning", duration?: number) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type, duration) => {
    const id = Math.random().toString(36).substring(2, 9)
    // Default durations: success (3s), warning (4s), error (6s)
    const defaultDurations = {
      success: 3000,
      warning: 4000,
      error: 6000,
    }
    const resolvedDuration = duration ?? defaultDurations[type]

    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration: resolvedDuration }],
    }))

    if (resolvedDuration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, resolvedDuration)
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

// Export a simple helper object for quick imports
export const toast = {
  success: (message: string, duration?: number) => useToastStore.getState().addToast(message, "success", duration),
  error: (message: string, duration?: number) => useToastStore.getState().addToast(message, "error", duration),
  warning: (message: string, duration?: number) => useToastStore.getState().addToast(message, "warning", duration),
}
