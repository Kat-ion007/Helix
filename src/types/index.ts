export type UserRole = "agent" | "lead" | "admin";

export type UserStatus = "active" | "inactive" | "invited";

export type TicketStatus = "open" | "pending" | "resolved" | "escalated";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type MessageSenderType = "agent" | "customer";

export type EscalationStatus = "open" | "closed";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  metadata: Record<string, unknown> | null;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customer_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  sla_due: string | null;
}

export interface Message {
  id: string;
  ticket_id: string;
  sender_type: MessageSenderType;
  sender_id: string | null;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface Escalation {
  id: string;
  ticket_id: string;
  from_user: string;
  to_user: string;
  reason: string | null;
  status: EscalationStatus;
  created_at: string;
}

export interface TicketActivity {
  id: string;
  ticket_id: string;
  actor_id: string | null;
  action: string;
  previous_value: string | null;
  new_value: string | null;
  timestamp: string;
}

export interface Macro {
  id: string;
  name: string;
  content: string;
  created_at: string;
}
