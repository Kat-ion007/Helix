"use client"

import { useState, useEffect, useRef } from "react"
import { MacroSelector } from "./macro-selector"
import { Button } from "@/components/ui/button"
import { Lock, Send, Eye, Paperclip, Hash, AtSign, X } from "lucide-react"
import { Tooltip } from "@/components/ui/tooltip"
import { toast } from "@/store/toast-store"
import { useAgents } from "@/hooks/use-agents"
import { supabase } from "@/lib/supabase/browser"

interface ReplyBoxProps {
  onSendMessage: (content: string, isInternal: boolean) => Promise<void>
  disabled?: boolean
}

export function ReplyBox({ onSendMessage, disabled = false }: ReplyBoxProps) {
  const [content, setContent] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)

  // Quick Action States
  const [attachments, setAttachments] = useState<File[]>([])
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [showTicketDropdown, setShowTicketDropdown] = useState(false)
  const [recentTickets, setRecentTickets] = useState<{ id: string; title: string }[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch agents list
  const { agents, loading: loadingAgents } = useAgents()

  useEffect(() => {
    const handleToggleInternalNote = () => {
      if (disabled || sending) return
      textareaRef.current?.focus()
      setIsInternal((prev) => !prev)
    }

    window.addEventListener("toggle-internal-note" as keyof WindowEventMap, handleToggleInternalNote as EventListener)
    return () => {
      window.removeEventListener("toggle-internal-note" as keyof WindowEventMap, handleToggleInternalNote as EventListener)
    }
  }, [disabled, sending])

  // Close dropdowns on outside click
  useEffect(() => {
    if (!showMentionDropdown && !showTicketDropdown) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".quick-action-container")) {
        setShowMentionDropdown(false)
        setShowTicketDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMentionDropdown, showTicketDropdown])

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) return
    setSending(true)
    try {
      let finalContent = content
      if (attachments.length > 0) {
        const attachmentText = attachments
          .map((file) => `📎 [Attachment: ${file.name}]`)
          .join("\n")
        finalContent = finalContent
          ? `${finalContent}\n\n${attachmentText}`
          : attachmentText
      }
      await onSendMessage(finalContent, isInternal)
      setContent("")
      setAttachments([])
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
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to send
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setContent((prev) => prev + textToInsert)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)
    
    setContent(before + textToInsert + after)
    
    const newCursorPos = start + textToInsert.length
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])
      toast.success(`Attached ${newFiles.length} file(s)`)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleOpenTicketDropdown = async () => {
    setShowTicketDropdown(!showTicketDropdown)
    setShowMentionDropdown(false)
    if (!showTicketDropdown && recentTickets.length === 0) {
      setLoadingTickets(true)
      try {
        const { data, error } = await supabase
          .from("ticket")
          .select("id, title")
          .order("updated_at", { ascending: false })
          .limit(10)
        if (error) throw error
        setRecentTickets(data || [])
      } catch (err) {
        console.error("Failed to load recent tickets:", err)
      } finally {
        setLoadingTickets(false)
      }
    }
  }

  return (
    <div
      className={`p-4 border-t transition-colors duration-200 relative ${
        isInternal
          ? "bg-surface-internal-note/40 border-warning/30"
          : "bg-surface-raised border-border/80"
      }`}
    >
      <div className="flex flex-col gap-3">
        {/* Text Area */}
        <textarea
          ref={textareaRef}
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

        {/* Attachment Display */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 py-1 select-none">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border/80 rounded-md text-xs text-text-primary transition-all hover:border-text-secondary animate-in fade-in zoom-in-95 duration-150"
              >
                <Paperclip size={12} className="text-text-secondary" />
                <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                <span className="text-[10px] text-text-secondary font-mono">({formatBytes(file.size)})</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="text-text-secondary hover:text-danger cursor-pointer ml-1 p-0.5 rounded-full hover:bg-surface-raised transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

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

            {/* Divider */}
            <div className="h-4 w-px bg-border/40 shrink-0" />

            {/* Quick Action: Attach Files */}
            <div className="relative quick-action-container">
              <Tooltip content="Attach Files (screenshots, PDFs, logs)">
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  disabled={disabled || sending}
                  className="flex items-center justify-center p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border/80 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Paperclip size={15} />
                </button>
              </Tooltip>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Quick Action: Mention User */}
            <div className="relative quick-action-container">
              <Tooltip content="Mention User (Notify agents, leads, managers)">
                <button
                  type="button"
                  onClick={() => {
                    setShowMentionDropdown(!showMentionDropdown)
                    setShowTicketDropdown(false)
                  }}
                  disabled={disabled || sending}
                  className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    showMentionDropdown
                      ? "bg-accent/15 border-accent/30 text-accent font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface border-transparent hover:border-border/80"
                  }`}
                >
                  <AtSign size={15} />
                </button>
              </Tooltip>

              {showMentionDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-56 max-h-60 overflow-y-auto bg-surface-overlay border border-border rounded-lg shadow-xl z-dropdown py-1 select-none animate-in fade-in slide-in-from-bottom-1 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-text-muted border-b border-border/50 uppercase tracking-wider">
                    Mention User
                  </div>
                  {loadingAgents ? (
                    <div className="px-3 py-2 text-xs text-text-secondary">Loading users...</div>
                  ) : agents.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-text-secondary">No users found</div>
                  ) : (
                    agents.map((agent) => (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => {
                          insertTextAtCursor(`@${agent.name} `)
                          setShowMentionDropdown(false)
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-surface-raised flex flex-col gap-0.5 transition-colors cursor-pointer group"
                      >
                        <span className="font-medium text-text-primary group-hover:text-accent transition-colors">
                          {agent.name}
                        </span>
                        <span className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">
                          {agent.role}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Quick Action: Reference Ticket */}
            <div className="relative quick-action-container">
              <Tooltip content="Reference Ticket (Link related tickets)">
                <button
                  type="button"
                  onClick={handleOpenTicketDropdown}
                  disabled={disabled || sending}
                  className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    showTicketDropdown
                      ? "bg-accent/15 border-accent/30 text-accent font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface border-transparent hover:border-border/80"
                  }`}
                >
                  <Hash size={15} />
                </button>
              </Tooltip>

              {showTicketDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-64 max-h-60 overflow-y-auto bg-surface-overlay border border-border rounded-lg shadow-xl z-dropdown py-1 select-none animate-in fade-in slide-in-from-bottom-1 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-text-muted border-b border-border/50 uppercase tracking-wider">
                    Reference Ticket
                  </div>
                  {loadingTickets ? (
                    <div className="px-3 py-2 text-xs text-text-secondary">Loading tickets...</div>
                  ) : recentTickets.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-text-secondary">No tickets found</div>
                  ) : (
                    recentTickets.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          insertTextAtCursor(`#${t.title} `)
                          setShowTicketDropdown(false)
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-text-primary hover:bg-surface-raised hover:text-accent transition-colors cursor-pointer truncate"
                        title={t.title}
                      >
                        {t.title}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            intent={isInternal ? "danger" : "default"}
            onClick={handleSend}
            disabled={(!content.trim() && attachments.length === 0) || disabled}
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

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

