export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customer: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          name?: string
        }
        Relationships: []
      }
      escalation: {
        Row: {
          created_at: string
          from_user: string
          id: string
          reason: string | null
          status: Database["public"]["Enums"]["escalation_status"]
          ticket_id: string
          to_user: string
        }
        Insert: {
          created_at?: string
          from_user: string
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["escalation_status"]
          ticket_id: string
          to_user: string
        }
        Update: {
          created_at?: string
          from_user?: string
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["escalation_status"]
          ticket_id?: string
          to_user?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalation_from_user_fkey"
            columns: ["from_user"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ticket"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_to_user_fkey"
            columns: ["to_user"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      macro: {
        Row: {
          created_at: string
          content: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          content: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          content?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      message: {
        Row: {
          content: string
          created_at: string
          id: string
          is_internal: boolean
          sender_id: string | null
          sender_type: Database["public"]["Enums"]["message_sender"]
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean
          sender_id?: string | null
          sender_type: Database["public"]["Enums"]["message_sender"]
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          sender_id?: string | null
          sender_type?: Database["public"]["Enums"]["message_sender"]
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ticket"
            referencedColumns: ["id"]
          }
        ]
      }
      ticket: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_id: string
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          sla_due: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          sla_due?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          sla_due?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["id"]
          }
        ]
      }
      ticket_activity: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          new_value: Json | null
          previous_value: Json | null
          ticket_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          ticket_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_activity_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_activity_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ticket"
            referencedColumns: ["id"]
          }
        ]
      }
      user: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      v_ticket_status_counts: {
        Row: {
          status: Database["public"]["Enums"]["ticket_status"] | null
          count: number | null
        }
      }
      v_sla_breach_count: {
        Row: {
          count: number | null
        }
      }
      v_agent_workload: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          agent_role: Database["public"]["Enums"]["user_role"] | null
          ticket_count: number | null
        }
      }
      v_resolution_trend: {
        Row: {
          resolved_date: string | null
          resolved_count: number | null
        }
      }
    }
    Functions: {
      escalate_ticket: {
        Args: {
          p_ticket_id: string
          p_from_user: string
          p_to_user: string
          p_reason?: string
        }
        Returns: string
      }
    }
    Enums: {
      escalation_status: "open" | "closed"
      message_sender: "agent" | "customer"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "pending" | "resolved" | "escalated"
      user_role: "agent" | "lead" | "admin"
    }
  }
}
