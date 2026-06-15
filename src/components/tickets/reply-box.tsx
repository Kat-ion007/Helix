"use client"

import { useState, useEffect } from "react"
import { MacroSelector } from "./macro-selector"
import { Button } from "@/components/ui/button"
import { Lock, Send, Eye } from "lucide-react"

interface ReplyBoxProps {
  onSendMessage: (content: string, isInternal: boolean) => Promise<void>
  disabled?: boolean
}

export function ReplyBox({ onSendMessage, disabled = false }: ReplyBoxProps) {
  const [content, setContent] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const handleToggleInternalNote = () => {
      if (disabled || sending) return
      const textarea = document.querySelector('textarea[placeholder*="Type a"]') as HTMLTextAreaElement
      if (textarea) {
        textarea.focus()
      }
      setIsInternal((prev) => !prev)
    }

    window.addEventListener("toggle-internal-note" as keyof WindowEventMap, handleToggleInternalNote as EventListener)
    return () => {
      window.removeEventListener("toggle-internal-note" as keyof WindowEventMap, handleToggleInternalNote as EventListener)
    }
  }, [disabled, sending])

  const handleSend = async () => {
    if (!content.trim()) return
    setSending(true)
    try {
      await onSendMessage(content, isInternal)
      setContent("")
    } catch (err) {
      console.error("[ReplyBox] Send error:", err)
    } finally {
      setSending(false)
    }
  }

  const handleSelectMacro = (macroContent: string) => {
    setContent((prev) => {
      const space = prev && !prev.endsWith("\n") ? "\n" : ""
      return prev + space + macroContent
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to send
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className={`p-4 border-t transition-colors duration-200 ${
        isInternal
          ? "bg-surface-internal-note/40 border-warning/30"
          : "bg-surface-raised border-border/80"
      }`}
    >
      <div className="flex flex-col gap-3">
        {/* Text Area */}
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          placeholder={
            isInternal
              ? "Type an internal note... (Only visible to other agents)"
              : "Type a reply to the customer... (Ctrl+Enter to send)"
          }
          className={`w-full bg-surface border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 resize-none transition-all ${
            isInternal
              ? "border-warning/30 focus:ring-warning focus:border-transparent"
              : "border-border/80 focus:ring-accent focus:border-transparent"
          }`}
        />

        {/* Toolbar Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Toggle Note / Public */}
            <button
              onClick={() => setIsInternal(!isInternal)}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold select-none border transition-all cursor-pointer ${
                isInternal
                  ? "bg-warning/15 border-warning/30 text-warning hover:bg-warning/20"
                  : "bg-surface border-border/80 text-text-secondary hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              {isInternal ? <Lock size={13} /> : <Eye size={13} />}
              <span>{isInternal ? "Internal Note" : "Public Reply"}</span>
            </button>

            {/* Macro Selector */}
            <MacroSelector onSelectMacro={handleSelectMacro} />
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            intent={isInternal ? "danger" : "default"} // Use danger variant as tinted warning/note accent
            onClick={handleSend}
            disabled={!content.trim() || disabled}
            isLoading={sending}
            className={`gap-1.5 ${
              isInternal
                ? "bg-warning/25 hover:bg-warning/35 text-warning border border-warning/30"
                : ""
            }`}
          >
            {isInternal ? (
              <>
                <Lock className="h-4 w-4" />
                Save Note
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Reply
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
