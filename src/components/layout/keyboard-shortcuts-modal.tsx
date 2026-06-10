"use client"

import { Modal } from "@/components/ui/modal"
import { Keyboard, Check, RefreshCw } from "lucide-react"

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const generalShortcuts = [
    { key: "Enter", description: "Open selected ticket" },
    { key: "J", description: "Next ticket" },
    { key: "K", description: "Previous ticket" },
    { key: "/", description: "Focus search input" },
    { key: "?", description: "Toggle shortcuts guide" },
  ]

  const detailShortcuts = [
    { key: "C", description: "Close ticket" },
    { key: "R", description: "Resolve ticket" },
    { key: "E", description: "Escalate ticket" },
    { key: "N", description: "Toggle internal note & focus" },
    { key: "Esc", description: "Back to Ticket Inbox" },
  ]

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="shortcuts-title">
      <Modal.Header>
        <h2 id="shortcuts-title" className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-text-primary">
          <Keyboard className="h-5 w-5 text-accent animate-pulse" />
          Keyboard Shortcuts Guide
        </h2>
        <Modal.CloseButton />
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-6 select-none">
          {/* General / Inbox section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-3 border-b border-border/40 pb-1.5">
              Inbox & General Navigation
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {generalShortcuts.map((s) => (
                <div key={s.key} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{s.description}</span>
                  <kbd className="min-w-[24px] h-6 px-1.5 py-0.5 bg-surface border border-border/80 rounded-md text-center text-xs font-bold text-accent font-mono shadow-sm flex items-center justify-center">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Detail section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-3 border-b border-border/40 pb-1.5">
              Ticket Detail Operations
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {detailShortcuts.map((s) => (
                <div key={s.key} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{s.description}</span>
                  <kbd className="min-w-[24px] h-6 px-1.5 py-0.5 bg-surface border border-border/80 rounded-md text-center text-xs font-bold text-accent font-mono shadow-sm flex items-center justify-center">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-text-muted text-center italic mt-2">
            Note: Shortcuts are disabled on mobile screens and when typing in text fields.
          </p>
        </div>
      </Modal.Body>
    </Modal>
  )
}
