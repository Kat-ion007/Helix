"use client"

import { useRef, useEffect } from "react"
import { MessageWithStatus } from "@/store/message-store"
import { Lock, AlertCircle, RefreshCw, Loader2, User as UserIcon } from "lucide-react"

interface ConversationThreadProps {
  messages: MessageWithStatus[]
  onRetry: (tempId: string, content: string, isInternal: boolean) => void
}

export function ConversationThread({ messages, onRetry }: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const formatMessageTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatMessageDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col min-h-0 bg-surface/20">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 text-text-secondary">
          <p className="text-sm">No messages in this thread yet.</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const isCustomer = msg.sender_type === "customer"
          const showDateDivider =
            index === 0 ||
            new Date(messages[index - 1].created_at).toDateString() !==
              new Date(msg.created_at).toDateString()

          return (
            <div key={msg.id} className="flex flex-col gap-4">
              {/* Date Divider */}
              {showDateDivider && (
                <div className="flex items-center justify-center my-2">
                  <div className="h-px bg-border/50 flex-1" />
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-3 select-none">
                    {formatMessageDate(msg.created_at)}
                  </span>
                  <div className="h-px bg-border/50 flex-1" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                className={`flex gap-3 max-w-[85%] ${
                  isCustomer ? "self-start" : "self-end flex-row-reverse"
                }`}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold select-none border uppercase ${
                      isCustomer
                        ? "bg-surface-raised border-border text-text-secondary"
                        : msg.is_internal
                        ? "bg-warning/15 border-warning/30 text-warning"
                        : "bg-accent/15 border-accent/30 text-accent"
                    }`}
                  >
                    {isCustomer ? "C" : msg.sender_name?.substring(0, 2) || <UserIcon size={12} />}
                  </div>
                </div>

                {/* Bubble Body */}
                <div className="flex flex-col gap-1">
                  {/* Sender Name / Time */}
                  <div
                    className={`flex items-center gap-2 text-[11px] font-semibold tracking-wide select-none ${
                      isCustomer ? "justify-start text-text-secondary" : "justify-end text-text-secondary"
                    }`}
                  >
                    <span>
                      {isCustomer
                        ? "Customer"
                        : msg.sender_name || "Agent"}
                    </span>
                    <span className="text-text-muted font-normal">
                      {formatMessageTime(msg.created_at)}
                    </span>
                    {msg.is_internal && (
                      <span className="flex items-center gap-0.5 text-warning font-semibold text-[10px] uppercase">
                        <Lock size={10} />
                        Internal Note
                      </span>
                    )}
                  </div>

                  {/* Message Bubble Box */}
                  <div
                    className={`rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-xs ${
                      isCustomer
                        ? "bg-surface-raised text-text-primary border border-border/60"
                        : msg.is_internal
                        ? "bg-surface-internal-note text-warning/90 border border-warning/20"
                        : "bg-accent/10 text-text-primary border border-accent/20"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Delivery Status / Error Retry */}
                  {!isCustomer && (
                    <div className="flex items-center justify-end gap-1.5 mt-1 select-none">
                      {msg.status === "sending" && (
                        <div className="flex items-center gap-1 text-[10px] text-text-muted">
                          <Loader2 size={10} className="animate-spin" />
                          Sending...
                        </div>
                      )}
                      {msg.status === "failed" && (
                        <div className="flex items-center gap-2 text-[10px] text-danger font-semibold">
                          <span className="flex items-center gap-0.5">
                            <AlertCircle size={10} />
                            Failed to send
                          </span>
                          <button
                            onClick={() => onRetry(msg.id, msg.content, msg.is_internal)}
                            className="flex items-center gap-0.5 hover:underline cursor-pointer focus:outline-none"
                          >
                            <RefreshCw size={8} />
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}
      <div ref={bottomRef} />
    </div>
  )
}
