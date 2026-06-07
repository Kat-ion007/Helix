import { create } from "zustand"
import { Message } from "@/types"

export interface MessageWithStatus extends Message {
  status?: "sending" | "failed" | "sent"
  sender_name?: string
}

interface MessageStore {
  messages: Record<string, MessageWithStatus[]> // ticketId -> messages
  setMessages: (ticketId: string, messages: MessageWithStatus[]) => void
  appendMessage: (ticketId: string, message: MessageWithStatus) => void
  updateMessage: (ticketId: string, tempId: string, updates: Partial<MessageWithStatus>) => void
  removeMessage: (ticketId: string, messageId: string) => void
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: {},
  setMessages: (ticketId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [ticketId]: messages,
      },
    })),
  appendMessage: (ticketId, message) =>
    set((state) => {
      const ticketMessages = state.messages[ticketId] || []
      // Deduplicate by message ID
      if (ticketMessages.some((m) => m.id === message.id)) {
        return state
      }
      return {
        messages: {
          ...state.messages,
          [ticketId]: [...ticketMessages, message],
        },
      }
    }),
  updateMessage: (ticketId, messageId, updates) =>
    set((state) => {
      const ticketMessages = state.messages[ticketId] || []
      const nextMessages = ticketMessages.map((m) => {
        if (m.id === messageId) {
          return { ...m, ...updates }
        }
        return m
      })
      return {
        messages: {
          ...state.messages,
          [ticketId]: nextMessages,
        },
      }
    }),
  removeMessage: (ticketId, messageId) =>
    set((state) => {
      const ticketMessages = state.messages[ticketId] || []
      return {
        messages: {
          ...state.messages,
          [ticketId]: ticketMessages.filter((m) => m.id !== messageId),
        },
      }
    }),
}))
