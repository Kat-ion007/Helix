"use client"

import { createContext, useContext, useEffect, useRef, ReactNode } from "react"
import { X } from "lucide-react"

interface ModalContextProps {
  onClose: () => void
}

const ModalContext = createContext<ModalContextProps | null>(null)

function useModalContext() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("Modal compound components must be used within a <Modal />")
  }
  return context
}

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  "aria-labelledby"?: string
}

export function Modal({ open, onClose, children, "aria-labelledby": ariaLabelledBy }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  // Focus Trap effect
  useEffect(() => {
    if (!open || !modalRef.current) return

    const modalElement = modalRef.current
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex="0"]'
    )
    
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    // Focus first interactive element when opened
    firstElement.focus()

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        // Shift + Tab: if on first element, cycle to last
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        // Tab: if on last element, cycle to first
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    modalElement.addEventListener("keydown", handleTabKey)
    return () => modalElement.removeEventListener("keydown", handleTabKey)
  }, [open])

  if (!open) return null

  return (
    <ModalContext.Provider value={{ onClose }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        className="fixed inset-0 z-modal flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          ref={modalRef}
          className="bg-surface-overlay border border-border/80 w-full max-w-[480px] rounded-xl shadow-2xl p-6 mx-auto flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()} // Prevent close on modal content click
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  )
}

interface HeaderProps {
  children: ReactNode
}

Modal.Header = function ModalHeader({ children }: HeaderProps) {
  return <div className="flex items-center justify-between border-b border-border/50 pb-3">{children}</div>
}

Modal.CloseButton = function ModalCloseButton({ "aria-label": ariaLabel = "Close modal" }: { "aria-label"?: string }) {
  const { onClose } = useModalContext()
  return (
    <button
      onClick={onClose}
      aria-label={ariaLabel}
      className="text-text-secondary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent rounded p-1 hover:bg-surface-raised transition-colors cursor-pointer"
    >
      <X size={18} />
    </button>
  )
}

Modal.Body = function ModalBody({ children }: { children: ReactNode }) {
  return <div className="text-body text-text-primary leading-relaxed py-2">{children}</div>
}

Modal.Footer = function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">{children}</div>
}
