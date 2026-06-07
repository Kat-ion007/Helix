"use client"

import { useState } from "react"
import { useMacros } from "@/hooks/use-macros"
import { ChevronDown, FileText, Loader2 } from "lucide-react"

interface MacroSelectorProps {
  onSelectMacro: (content: string) => void
}

export function MacroSelector({ onSelectMacro }: MacroSelectorProps) {
  const { macros, loading, error } = useMacros()
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (content: string) => {
    onSelectMacro(content)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border/80 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all select-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin text-text-muted" />
        ) : (
          <FileText className="h-3.5 w-3.5" />
        )}
        <span>Macros</span>
        <ChevronDown className="h-3 w-3 text-text-muted" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-surface-overlay border border-border/80 rounded-lg shadow-xl z-dropdown overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3 py-2 border-b border-border/40 bg-surface/30">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Select reply template
            </span>
          </div>

          {error ? (
            <div className="px-3 py-2 text-xs text-danger">Failed to load templates.</div>
          ) : macros.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-muted">No macros available.</div>
          ) : (
            <div className="max-h-48 overflow-y-auto divide-y divide-border/40">
              {macros.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m.content)}
                  className="w-full text-left px-3.5 py-2 text-xs text-text-primary hover:bg-accent/10 hover:text-accent font-medium transition-colors focus:outline-none focus:bg-accent/10 cursor-pointer truncate"
                  title={m.name}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
