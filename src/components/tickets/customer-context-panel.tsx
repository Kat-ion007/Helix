"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/browser"
import { Customer } from "@/types"
import { Mail, Shield, AlertCircle, History, User } from "lucide-react"

interface CustomerContextPanelProps {
  customer?: Customer | null
}

export function CustomerContextPanel({ customer }: CustomerContextPanelProps) {
  const [ticketCounts, setTicketCounts] = useState({ open: 0, resolved: 0 })

  useEffect(() => {
    async function loadCustomerTicketCounts() {
      if (!customer?.id) return
      try {
        const { count: openCount } = await supabase
          .from("ticket")
          .select("id", { count: "exact", head: true })
          .eq("customer_id", customer.id)
          .in("status", ["open", "pending", "escalated"])

        const { count: resolvedCount } = await supabase
          .from("ticket")
          .select("id", { count: "exact", head: true })
          .eq("customer_id", customer.id)
          .eq("status", "resolved")

        setTicketCounts({
          open: openCount || 0,
          resolved: resolvedCount || 0,
        })
      } catch (err) {
        console.error("[CustomerContextPanel] Failed to fetch ticket counts:", err)
      }
    }
    loadCustomerTicketCounts()
  }, [customer?.id])

  if (!customer) {
    return (
      <aside className="w-72 bg-surface-raised border-l border-border/80 p-5 flex flex-col items-center justify-center text-center text-text-secondary select-none">
        <User size={36} className="text-text-muted mb-2 animate-pulse" />
        <p className="text-xs font-semibold uppercase tracking-wider">No Customer Profile</p>
        <p className="text-xs text-text-muted mt-1">This ticket has no associated customer context.</p>
      </aside>
    )
  }

  // Tier mappings
  const metadata = customer.metadata || {}
  const tier = (metadata.tier as string) || "free"

  const tierStyles = {
    enterprise: "bg-danger/10 border-danger/35 text-danger font-semibold text-[10px] uppercase",
    pro: "bg-accent/10 border-accent/35 text-accent font-semibold text-[10px] uppercase",
    free: "bg-border/20 border-border/40 text-text-secondary font-semibold text-[10px] uppercase",
  }

  const tierStyle = tierStyles[tier as keyof typeof tierStyles] || tierStyles.free

  return (
    <aside className="w-72 bg-surface-raised border-l border-border/80 flex flex-col h-full shrink-0 overflow-y-auto select-none">
      {/* Customer Header */}
      <div className="p-5 border-b border-border/50 flex flex-col items-center text-center">
        <div className="h-14 w-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-lg font-bold uppercase mb-3.5 shadow-sm">
          {customer.name.substring(0, 2)}
        </div>
        <h3 className="text-sm font-semibold text-text-primary truncate w-full" title={customer.name}>
          {customer.name}
        </h3>
        <p className="text-xs text-text-secondary flex items-center gap-1.5 justify-center mt-1 truncate w-full">
          <Mail size={12} className="text-text-muted" />
          <span className="truncate">{customer.email}</span>
        </p>

        {/* SLA Tier badge */}
        <div className="mt-3.5">
          <span className={`px-2 py-0.5 rounded border tracking-wider ${tierStyle}`}>
            {tier} Tier
          </span>
        </div>
      </div>

      {/* Ticket History stats */}
      <div className="p-5 border-b border-border/50">
        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
          <History size={12} />
          <span>Ticket Statistics</span>
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface/40 p-3 rounded-lg border border-border/45">
            <span className="block text-xl font-bold text-text-primary">{ticketCounts.open}</span>
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
              Active
            </span>
          </div>
          <div className="bg-surface/40 p-3 rounded-lg border border-border/45">
            <span className="block text-xl font-bold text-text-primary">{ticketCounts.resolved}</span>
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
              Resolved
            </span>
          </div>
        </div>
      </div>

      {/* Metadata Detail info */}
      <div className="p-5 flex-1">
        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
          <Shield size={12} />
          <span>Metadata Info</span>
        </h4>
        <div className="space-y-3">
          {Object.entries(metadata).map(([key, val]) => (
            <div key={key} className="flex flex-col">
              <span className="text-[10px] font-semibold text-text-secondary capitalize">
                {key.replace("_", " ")}
              </span>
              <span className="text-xs font-semibold text-text-primary mt-0.5">
                {typeof val === "object" ? JSON.stringify(val) : String(val)}
              </span>
            </div>
          ))}
          {Object.keys(metadata).length === 0 && (
            <div className="flex items-center gap-1.5 text-xs text-text-muted py-2">
              <AlertCircle size={13} />
              <span>No custom metadata.</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
