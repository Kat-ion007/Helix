"use client"

import { useEffect } from "react"

export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  disabled: boolean = false
) {
  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in inputs or editable elements
      const target = e.target as HTMLElement
      if (
        !target ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      // Exact matching or simple letter matching (case-insensitive)
      const key = e.key.toLowerCase()
      
      // Also support special symbols like '/'
      const matchedKey = e.key === "/" ? "/" : key

      if (shortcuts[matchedKey]) {
        e.preventDefault()
        shortcuts[matchedKey]()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, disabled])
}
