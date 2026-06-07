"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { supabase } from "@/lib/supabase/browser"
import { useMessageStore } from "@/store/message-store"
import { useUserStore } from "@/store/user-store"
import { toast } from "@/store/toast-store"

function generateTempId() {
  return `temp-${Math.random().toString(36).substring(2, 9)}`
}

export function useSendMessage() {
  const { appendMessage, updateMessage, removeMessage } = useMessageStore()
  const profile = useUserStore((state) => state.profile)
  const [sending, setSending] = useState(false)

  const sendMessage = async (
    ticketId: string,
    content: string,
    isInternal: boolean = false
  ) => {
    if (!profile) {
      toast.error("You must be logged in to send messages.")
      return
    }

    const tempId = generateTempId()
    
    // 1. Optimistic insert
    appendMessage(ticketId, {
      id: tempId,
      ticket_id: ticketId,
      sender_type: "agent",
      sender_id: profile.id,
      content,
      is_internal: isInternal,
      created_at: new Date().toISOString(),
      sender_name: profile.name,
      status: "sending",
    })

    setSending(true)

    // Call the actual helper to write to database
    await attemptSend(ticketId, tempId, content, isInternal, 0)
  }

  const attemptSend = async (
    ticketId: string,
    tempId: string,
    content: string,
    isInternal: boolean,
    retries: number
  ) => {
    try {
      const { data, error } = await (supabase.from("message") as any)
        .insert({
          ticket_id: ticketId,
          sender_type: "agent",
          sender_id: profile?.id,
          content,
          is_internal: isInternal,
        })
        .select()
        .single()

      if (error) throw error

      // 2. Success: replace temp message with actual
      removeMessage(ticketId, tempId)
      appendMessage(ticketId, {
        ...(data as any),
        sender_name: profile?.name,
        status: "sent",
      } as any)

      setSending(false)
    } catch (err: any) {
      console.error("[useSendMessage] Error sending message:", err)

      if (retries < 2) {
        // Auto-retry up to 3 times (0-indexed retries, so 0, 1, 2)
        const nextRetry = retries + 1
        console.warn(`[useSendMessage] Retrying send (attempt ${nextRetry + 1}/3)...`)
        await attemptSend(ticketId, tempId, content, isInternal, nextRetry)
      } else {
        // Failed after 3 attempts
        updateMessage(ticketId, tempId, { status: "failed" })
        toast.error("Unable to send message. Please check connection and retry.")
        setSending(false)
      }
    }
  }

  const retryMessage = async (
    ticketId: string,
    tempId: string,
    content: string,
    isInternal: boolean
  ) => {
    updateMessage(ticketId, tempId, { status: "sending" })
    setSending(true)
    await attemptSend(ticketId, tempId, content, isInternal, 0)
  }

  return {
    sendMessage,
    retryMessage,
    sending,
  }
}
