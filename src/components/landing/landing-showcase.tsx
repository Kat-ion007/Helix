"use client"

import { useState } from "react"
import { Inbox, FileText, Share2, BarChart2, Clock, Check, ShieldCheck } from "lucide-react"

type ActiveTab = "inbox" | "detail" | "escalate" | "dashboard"

export function LandingShowcase() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("inbox")

  const tabs = [
    { id: "inbox" as ActiveTab, label: "Ticket Inbox", icon: Inbox },
    { id: "detail" as ActiveTab, label: "Detail View", icon: FileText },
    { id: "escalate" as ActiveTab, label: "Escalation Flow", icon: Share2 },
    { id: "dashboard" as ActiveTab, label: "Manager Dashboard", icon: BarChart2 },
  ]

  return (
    <section className="py-16 lg:py-24 border-b border-border/40 bg-surface-raised/40 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col gap-4">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Product Showcase
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Explore the Helix Interface
          </h2>
          <p className="text-sm sm:text-base text-text-secondary">
            Click through the core views of the operations platform to see how support agents and managers work inside Helix.
          </p>
        </div>

        {/* Interactive Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 border-b border-border/40 pb-4 max-w-2xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? "bg-accent border-accent text-white shadow-md shadow-accent/15"
                    : "bg-surface-raised border-border/80 text-text-secondary hover:text-text-primary hover:border-border"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Previews - High-Fidelity Mockups */}
        <div className="relative rounded-2xl border border-border/80 bg-surface shadow-md overflow-hidden aspect-[16/9] w-full max-w-5xl mx-auto flex flex-col animate-in fade-in duration-300">
          
          {/* Browser Header Bar */}
          <div className="bg-surface-raised border-b border-border/80 px-4 py-2.5 flex items-center justify-between">
            <div className="flex gap-1.5 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
            </div>
            <div className="bg-surface border border-border/60 rounded px-4 py-0.5 text-[10px] text-text-secondary font-mono flex items-center justify-center min-w-[280px] select-none">
              <span>helix.internal/{activeTab === "dashboard" ? "dashboard" : "inbox"}</span>
            </div>
            <div className="w-10" />
          </div>

          {/* Render Active View */}
          <div className="flex-1 overflow-hidden bg-surface flex text-left text-xs text-text-primary">
            
            {/* TICKET INBOX TAB */}
            {activeTab === "inbox" && (
              <div className="flex-1 flex flex-col bg-surface overflow-y-auto">
                {/* Inbox header */}
                <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-bold">Ticket Inbox</h3>
                    <div className="flex border border-border rounded-md overflow-hidden bg-surface-raised">
                      <span className="px-2.5 py-1 bg-accent text-white text-[10px] font-bold">Open</span>
                      <span className="px-2.5 py-1 text-[10px] font-bold text-text-secondary border-l border-border hover:bg-surface-overlay cursor-pointer">Pending</span>
                      <span className="px-2.5 py-1 text-[10px] font-bold text-text-secondary border-l border-border hover:bg-surface-overlay cursor-pointer">Resolved</span>
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    <span className="px-3 py-1 bg-surface-raised border border-border/80 rounded font-semibold text-text-secondary hover:text-text-primary cursor-pointer">
                      Filter priority
                    </span>
                    <span className="px-3 py-1 bg-accent text-white rounded font-bold hover:bg-accent-hover cursor-pointer">
                      Bulk Actions
                    </span>
                  </div>
                </div>

                {/* Inbox Rows */}
                <div className="flex flex-col">
                  {/* Row 1 */}
                  <div className="px-5 py-3.5 border-l-[3.5px] border-l-danger bg-accent/5 border-b border-border/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <input type="checkbox" checked readOnly className="h-4 w-4 rounded border-border text-accent focus:ring-accent shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold truncate">Checkout process timeouts on production API</p>
                          <span className="text-[9px] text-text-muted font-mono font-normal">#2c7f55</span>
                        </div>
                        <p className="text-[10px] text-text-secondary truncate">Stripe Inc. • developer@stripe.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-danger/15 text-danger border border-danger/20">Urgent</span>
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-info/15 text-info">Open</span>
                      <div className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[9px]">AH</div>
                      <span className="text-danger flex items-center gap-1 font-mono text-[10px] font-bold min-w-[70px] justify-end">
                        <Clock size={11} /> 12m due
                      </span>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="px-5 py-3.5 border-l-[3.5px] border-l-warning bg-accent/5 border-b border-border/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <input type="checkbox" checked readOnly className="h-4 w-4 rounded border-border text-accent focus:ring-accent shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold truncate">Billing data discrepancy on monthly statements</p>
                          <span className="text-[9px] text-text-muted font-mono font-normal">#443a61</span>
                        </div>
                        <p className="text-[10px] text-text-secondary truncate">Clara Oswald • clara@oswald.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-warning/15 text-warning">High</span>
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-info/15 text-info">Open</span>
                      <div className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[9px]">AH</div>
                      <span className="text-warning flex items-center gap-1 font-mono text-[10px] font-bold min-w-[70px] justify-end">
                        <Clock size={11} /> 48m due
                      </span>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="px-5 py-3.5 border-l-[3.5px] border-l-info border-b border-border/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <input type="checkbox" readOnly className="h-4 w-4 rounded border-border text-accent focus:ring-accent shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold truncate">Update account subscription details</p>
                          <span className="text-[9px] text-text-muted font-mono font-normal">#18468c</span>
                        </div>
                        <p className="text-[10px] text-text-secondary truncate">Danny Pink • danny@pink.org</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-info/15 text-info">Medium</span>
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-info/15 text-info">Open</span>
                      <div className="h-6.5 w-6.5 border border-dashed border-border rounded-full flex items-center justify-center text-[10px] text-text-muted bg-surface-raised">—</div>
                      <span className="text-text-secondary flex items-center gap-1 font-mono text-[10px] min-w-[70px] justify-end">
                        <Clock size={11} /> 3h due
                      </span>
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="px-5 py-3.5 border-l-[3.5px] border-l-border/40 border-b border-border/30 flex items-center justify-between gap-4 opacity-70">
                    <div className="flex items-center gap-3 min-w-0">
                      <input type="checkbox" readOnly className="h-4 w-4 rounded border-border text-accent focus:ring-accent shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold truncate">General feedback on user roles dashboard UI</p>
                          <span className="text-[9px] text-text-muted font-mono font-normal">#111a2f</span>
                        </div>
                        <p className="text-[10px] text-text-secondary truncate">Marcus Aurelius • marcus@rome.net</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-border/30 text-text-secondary">Low</span>
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-success/15 text-success">Resolved</span>
                      <div className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[9px]">KC</div>
                      <span className="text-text-secondary flex items-center gap-1 font-mono text-[10px] min-w-[70px] justify-end">
                        <Check size={11} /> Done
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DETAIL VIEW TAB */}
            {activeTab === "detail" && (
              <div className="flex-1 grid grid-cols-12 overflow-hidden bg-surface">
                {/* Thread Column (Col: 8) */}
                <div className="col-span-8 border-r border-border/40 flex flex-col p-4 gap-4 overflow-y-auto">
                  {/* Ticket Summary */}
                  <div className="flex items-start justify-between border-b border-border/40 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-text-primary mb-1">Checkout process timeouts on production API</h3>
                      <p className="text-[10px] text-text-secondary">Ticket ID: #2c7f55 • Created: Jun 16, 2026</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-info/15 text-info uppercase">Open</span>
                  </div>

                  {/* Message Thread */}
                  <div className="flex flex-col gap-3.5">
                    {/* Customer Post */}
                    <div className="bg-surface-raised border border-border/40 rounded-xl p-3.5 flex flex-col gap-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-primary">developer@stripe.com</span>
                          <span className="text-[9px] bg-border/50 text-text-secondary px-1.5 py-0.2 rounded font-semibold uppercase">Customer</span>
                        </div>
                        <span className="text-[10px] text-text-secondary">2 hours ago</span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        We are experiencing recurring timeouts (HTTP 504) when hitting the webhook delivery endpoint. This is causing critical checkout failures on production. Please assist immediately.
                      </p>
                    </div>

                    {/* Internal Note */}
                    <div className="bg-surface-internal-note border border-warning/20 rounded-xl p-3.5 flex flex-col gap-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-warning flex items-center gap-1">🔒 Internal Agent Note</span>
                        </div>
                        <span className="text-[10px] text-text-secondary">45 minutes ago</span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        Exhausted connections suspected on db. Investigated memory allocation, which is climbing. Handing off L2 ownership.
                      </p>
                    </div>
                  </div>

                  {/* Reply actions */}
                  <div className="mt-auto border-t border-border/40 pt-3 flex flex-col gap-2">
                    <div className="bg-surface-raised border border-border/80 rounded-lg p-2.5 text-[11px] text-text-muted">
                      Write a response to Stripe developers...
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="px-2.5 py-1 bg-surface-raised border border-border/80 text-[10px] font-bold rounded text-text-secondary hover:text-text-primary cursor-pointer">Use Macro</span>
                        <span className="px-2.5 py-1 bg-surface-raised border border-border/80 text-[10px] font-bold rounded text-text-secondary hover:text-text-primary cursor-pointer">Internal Note</span>
                      </div>
                      <span className="px-4 py-1.5 bg-accent text-white font-bold rounded text-[10px] hover:bg-accent-hover cursor-pointer shadow-xs">Send Reply</span>
                    </div>
                  </div>
                </div>

                {/* Customer Context Panel (Col: 4) */}
                <div className="col-span-4 bg-surface-raised p-4 flex flex-col gap-4 overflow-y-auto">
                  <h4 className="font-bold text-xs border-b border-border/40 pb-2">Customer Profile</h4>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
                      ST
                    </div>
                    <div>
                      <h5 className="font-bold">Stripe Inc.</h5>
                      <p className="text-[10px] text-text-secondary">L2 Technical Integration</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border/40 pt-3">
                    <div>
                      <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider block">Authorized Contact</span>
                      <span className="font-semibold text-text-primary">developer@stripe.com</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider block">SLA Priority Tier</span>
                      <span className="font-semibold text-danger">Tier-1 Urgent (60min Response)</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider block">Billing Tier</span>
                      <span className="font-semibold text-text-primary">Enterprise ($4,500/mo)</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider block">Hosting Environment</span>
                      <span className="font-mono text-text-secondary text-[10px]">aws::us-east-1::production</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ESCALATION FLOW TAB */}
            {activeTab === "escalate" && (
              <div className="flex-1 grid grid-cols-12 overflow-hidden bg-surface relative">
                {/* Simulated detail behind */}
                <div className="col-span-8 border-r border-border/40 flex flex-col p-4 gap-4 opacity-40">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-sm font-bold">Checkout process timeouts on production API</h3>
                  </div>
                  <div className="bg-surface-raised border border-border/40 rounded-xl p-3.5">
                    <p className="text-[11px] text-text-secondary">We are experiencing recurring timeouts (HTTP 504)...</p>
                  </div>
                </div>
                <div className="col-span-4 bg-surface-raised p-4 opacity-40">
                  <h4 className="font-bold text-xs border-b border-border pb-2">Customer Profile</h4>
                </div>

                {/* Overlaid Escalation Modal Centered */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                  <div className="bg-surface-overlay border border-border rounded-xl shadow-md p-5 w-full max-w-[380px] flex flex-col gap-3.5">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                        <Share2 size={14} className="text-accent" />
                        <span>Escalate Ticket</span>
                      </h3>
                      <span className="text-[9px] bg-border px-1.5 py-0.5 rounded text-text-secondary font-mono">T-2c7f55</span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Target Escalation Department *
                      </label>
                      <div className="w-full bg-surface border border-border/80 rounded px-2.5 py-1.5 text-xs text-text-primary font-medium flex justify-between">
                        <span>DevOps & Infrastructure Team</span>
                        <span>▼</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Handoff Reason & Context
                      </label>
                      <div className="w-full bg-surface border border-border/80 rounded px-2.5 py-1.5 text-xs text-text-secondary min-h-[60px] leading-relaxed">
                        L2 escalation: Server returning 504 Gateway Timeouts. Database connection pool is fully saturated. Transferring ticket ownership.
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-accent/5 border border-accent/15 rounded text-[10px] text-accent">
                      <ShieldCheck size={14} className="shrink-0" />
                      <span>This action transfers primary ownership and registers audit log trail.</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                      <span className="px-3 py-1.5 bg-surface-raised border border-border rounded text-[10px] font-bold text-text-secondary">Cancel</span>
                      <span className="px-3 py-1.5 bg-accent text-white font-bold rounded text-[10px] flex items-center gap-1 shadow-xs">
                        Escalate Owner
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MANAGER DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <div className="flex-1 flex flex-col p-5 bg-surface-raised/40 gap-5 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Manager Overview</h3>
                    <p className="text-[10px] text-text-secondary">Live metrics and SLA compliance status</p>
                  </div>
                  <span className="text-[9px] font-mono text-text-secondary">Last updated: Just now</span>
                </div>

                {/* 4 Metric Cards Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-surface-raised border border-border/80 rounded-xl p-3.5 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Open Tickets</span>
                    <span className="text-lg font-black text-text-primary">12</span>
                    <span className="text-[9px] text-success font-semibold font-mono">↓ -15% vs yesterday</span>
                  </div>
                  
                  <div className="bg-surface-raised border border-border/80 rounded-xl p-3.5 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">SLA Risk</span>
                    <span className="text-lg font-black text-warning">3</span>
                    <span className="text-[9px] text-warning font-semibold font-mono">⚠️ 25m avg warning</span>
                  </div>
                  
                  <div className="bg-surface-raised border border-border/80 rounded-xl p-3.5 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Breached SLAs</span>
                    <span className="text-lg font-black text-danger">1</span>
                    <span className="text-[9px] text-danger font-semibold font-mono">🚨 Critical response overdue</span>
                  </div>

                  <div className="bg-surface-raised border border-border/80 rounded-xl p-3.5 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Avg Resolve Time</span>
                    <span className="text-lg font-black text-accent">34m</span>
                    <span className="text-[9px] text-success font-semibold font-mono">↓ -8m vs target</span>
                  </div>
                </div>

                {/* Workload list */}
                <div className="bg-surface-raised border border-border/80 rounded-xl p-4 flex flex-col gap-3 max-w-2xl">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <h4 className="font-bold text-xs text-text-primary">Active Agent Workload Distribution</h4>
                    <span className="text-[9px] text-text-secondary uppercase">3 Agents Online</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Agent 1 */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold">Marcus Wright</span>
                        <span className="text-text-secondary font-mono">4 open tickets (40%)</span>
                      </div>
                      <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
                        <div className="h-full w-[40%] bg-success" />
                      </div>
                    </div>

                    {/* Agent 2 */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold">John Connor</span>
                        <span className="text-warning font-bold font-mono">8 open tickets (80%)</span>
                      </div>
                      <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
                        <div className="h-full w-[80%] bg-warning" />
                      </div>
                    </div>

                    {/* Agent 3 */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold">Kyle Reese</span>
                        <span className="text-danger font-bold font-mono">11 open tickets (110% overload)</span>
                      </div>
                      <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-danger animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  )
}
