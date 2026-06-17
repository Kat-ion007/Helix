"use client"

import { Inbox, UserCheck, Zap, BarChart3 } from "lucide-react"

export function LandingFeatures() {
  return (
    <section id="features" className="py-16 lg:py-24 border-b border-border/40 bg-surface-raised/30">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col gap-4">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Features & Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Built for Support Speed
          </h2>
          <p className="text-sm sm:text-base text-text-secondary">
            Every feature is designed to eliminate context switching, automate repetitive actions, and keep team leads in sync with the live queue.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="flex flex-col gap-16">
          
          {/* Feature 1 & 2 Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Feature 1: Centralized Ticket Inbox */}
            <div className="bg-surface-raised border border-border/80 rounded-2xl p-6 lg:p-8 flex flex-col gap-6 shadow-xs group">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-info/10 text-info border border-info/20 flex items-center justify-center">
                  <Inbox size={18} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Centralized Ticket Inbox
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Filter and sort tickets instantly by status, priority, and assigned agent. Handle bulk actions like updates, re-assignments, or status changes in a single action.
              </p>

              {/* Mockup - Ticket list with filter */}
              <div className="bg-surface rounded-xl border border-border/60 overflow-hidden flex flex-col mt-2 select-none">
                <div className="bg-surface-raised border-b border-border/40 px-3 py-2 flex items-center justify-between text-[11px] text-text-secondary">
                  <div className="flex gap-2 font-medium">
                    <span className="text-accent border-b border-accent px-1">All</span>
                    <span className="hover:text-text-primary">Assigned</span>
                    <span className="hover:text-text-primary">Urgent</span>
                  </div>
                  <span className="text-[10px] text-text-muted">Bulk Actions (2 Selected)</span>
                </div>
                
                <div className="flex flex-col">
                  {/* Row 1 */}
                  <div className="px-3 py-2.5 border-l-[3px] border-l-danger bg-accent/5 border-b border-border/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <input type="checkbox" checked readOnly className="h-3 w-3 rounded border-border" />
                      <span className="text-xs font-semibold text-text-primary truncate">Checkout failed</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-danger bg-danger/10 px-1.5 py-0.5 rounded shrink-0">
                      Urgent
                    </span>
                  </div>
                  
                  {/* Row 2 */}
                  <div className="px-3 py-2.5 border-l-[3px] border-l-warning bg-accent/5 border-b border-border/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <input type="checkbox" checked readOnly className="h-3 w-3 rounded border-border" />
                      <span className="text-xs font-semibold text-text-primary truncate">Invoice mismatch</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-warning bg-warning/10 px-1.5 py-0.5 rounded shrink-0">
                      High
                    </span>
                  </div>
                  
                  {/* Row 3 */}
                  <div className="px-3 py-2.5 border-l-[3px] border-l-info border-b border-border/30 flex items-center justify-between gap-3 opacity-60">
                    <div className="flex items-center gap-2 min-w-0">
                      <input type="checkbox" readOnly className="h-3 w-3 rounded border-border" />
                      <span className="text-xs font-semibold text-text-primary truncate">Change billing date</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-info bg-info/10 px-1.5 py-0.5 rounded shrink-0">
                      Medium
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Unified Customer Context */}
            <div className="bg-surface-raised border border-border/80 rounded-2xl p-6 lg:p-8 flex flex-col gap-6 shadow-xs group">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent border border-accent/20 flex items-center justify-center">
                  <UserCheck size={18} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Unified Customer Context
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                See client profiles, custom metadata, and conversation histories alongside the ticket thread. Never query another database for client status.
              </p>

              {/* Mockup - Customer Context Panel */}
              <div className="bg-surface rounded-xl border border-border/60 overflow-hidden flex flex-col mt-2 select-none">
                <div className="bg-surface-raised border-b border-border/40 px-3 py-2 flex items-center gap-2 text-[11px] font-bold text-text-primary">
                  <span>Customer Context</span>
                </div>
                
                <div className="p-3.5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
                      SO
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">Sarah Connor</h4>
                      <p className="text-[10px] text-text-secondary">sarah@cyberdyne.io</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-border/40 pt-2">
                    <div>
                      <span className="text-text-muted block font-semibold uppercase tracking-wider text-[8px]">Plan Tier</span>
                      <span className="text-text-primary font-medium">Enterprise</span>
                    </div>
                    <div>
                      <span className="text-text-muted block font-semibold uppercase tracking-wider text-[8px]">Arr</span>
                      <span className="text-text-primary font-mono font-medium">$45,000/yr</span>
                    </div>
                    <div>
                      <span className="text-text-muted block font-semibold uppercase tracking-wider text-[8px]">Sla Tier</span>
                      <span className="text-danger font-medium">1 Hour Response</span>
                    </div>
                    <div>
                      <span className="text-text-muted block font-semibold uppercase tracking-wider text-[8px]">Region</span>
                      <span className="text-text-primary font-medium">US-East (Virginia)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Feature 3 & 4 Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Feature 3: Structured Escalations */}
            <div className="bg-surface-raised border border-border/80 rounded-2xl p-6 lg:p-8 flex flex-col gap-6 shadow-xs group">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-escalated/10 text-escalated border border-escalated/20 flex items-center justify-center">
                  <Zap size={18} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Structured Escalations
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Escalate complex issues atomically via an embedded workflow. System automatically re-assigns ownership and keeps handoff history intact without losing momentum.
              </p>

              {/* Mockup - Handoff interface */}
              <div className="bg-surface rounded-xl border border-border/60 overflow-hidden flex flex-col mt-2 select-none">
                <div className="bg-surface-raised border-b border-border/40 px-3 py-2 flex items-center justify-between text-[11px] font-bold text-text-primary">
                  <span>Escalation Workspace</span>
                  <span className="text-[9px] text-text-muted font-mono font-normal">Ticket #T-800</span>
                </div>
                
                <div className="p-3.5 flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-semibold text-text-secondary uppercase">Target Department</span>
                    <div className="w-full bg-surface-raised border border-border/60 rounded px-2 py-1 text-[10px] text-text-primary font-medium flex justify-between">
                      <span>DevOps & Infrastructure</span>
                      <span>▼</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-semibold text-text-secondary uppercase">Reason for Handoff</span>
                    <div className="w-full bg-surface-raised border border-border/60 rounded px-2 py-1 text-[10px] text-text-secondary leading-relaxed">
                      L2 assistance required. DB connection pool exhausted. Requires sysadmin intervention.
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-border/30">
                    <span className="px-2 py-1 bg-accent/10 border border-accent/20 rounded text-[9px] font-bold text-accent">
                      Escalate Owner
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Real-Time Team Visibility */}
            <div className="bg-surface-raised border border-border/80 rounded-2xl p-6 lg:p-8 flex flex-col gap-6 shadow-xs group">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-success/10 text-success border border-success/20 flex items-center justify-center">
                  <BarChart3 size={18} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Real-Time Team Visibility
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Monitor agent queues, workload distributions, and live SLA timings. Ensure no individual agent is overwhelmed and tickets are processed strictly within limits.
              </p>

              {/* Mockup - Live Workload list */}
              <div className="bg-surface rounded-xl border border-border/60 overflow-hidden flex flex-col mt-2 select-none">
                <div className="bg-surface-raised border-b border-border/40 px-3 py-2 flex items-center justify-between text-[11px] font-bold text-text-primary">
                  <span>Agent Workloads</span>
                  <span className="text-[9px] text-success flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" /> Live</span>
                </div>
                
                <div className="p-3 flex flex-col gap-2.5">
                  {/* Agent 1 */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-semibold text-text-primary">Marcus Wright</span>
                      <span className="text-text-secondary">4 tickets (40%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                      <div className="h-full w-[40%] bg-success" />
                    </div>
                  </div>
                  
                  {/* Agent 2 */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-semibold text-text-primary">John Connor</span>
                      <span className="text-warning font-semibold">8 tickets (80%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                      <div className="h-full w-[80%] bg-warning" />
                    </div>
                  </div>

                  {/* Agent 3 */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-semibold text-text-primary">Kyle Reese</span>
                      <span className="text-danger font-semibold">11 tickets (110%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-danger animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
