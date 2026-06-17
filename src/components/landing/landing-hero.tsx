"use client"

import Link from "next/link"
import { Play, ArrowRight, ShieldCheck, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingHeroProps {
  onBookDemo: () => void
}

export function LandingHero({ onBookDemo }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24 border-b border-border/40 bg-linear-to-b from-surface to-surface-raised/40">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-12 left-10 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left column: Text Content */}
        <div className="lg:col-span-5 flex flex-col gap-6 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-1.5 self-center lg:self-start px-2.5 py-1 rounded-full border border-accent/25 bg-accent/5 text-xs font-semibold text-accent">
            <ShieldCheck size={14} />
            <span>Helix Enterprise MVP v1.0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight leading-tight select-none">
            Resolve Customer Tickets{" "}
            <span className="text-accent bg-linear-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              Faster
            </span>{" "}
            Without Switching Tools
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Helix helps support teams manage tickets, customer context, escalations, and workload visibility from a single streamlined workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto text-base font-semibold"
              onClick={onBookDemo}
            >
              Book a Demo
              <ArrowRight size={18} />
            </Button>
            <Link
              href="/login"
              className="inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface outline-none cursor-pointer bg-surface-raised border border-border/80 hover:bg-surface-overlay text-text-primary px-6 py-3 text-base gap-2 h-11 w-full sm:w-auto"
            >
              <Play size={16} fill="currentColor" />
              View Walkthrough
            </Link>
          </div>

          {/* Social Proof / Badges */}
          <div className="pt-6 border-t border-border/50 grid grid-cols-3 gap-4 text-center lg:text-left">
            <div>
              <p className="text-xl font-bold text-text-primary">2.5s</p>
              <p className="text-xs text-text-secondary">App Load Time</p>
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">-25%</p>
              <p className="text-xs text-text-secondary">Resolution Speed</p>
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">&lt;3s</p>
              <p className="text-xs text-text-secondary">Real-Time Sync</p>
            </div>
          </div>
        </div>

        {/* Right column: High-Fidelity App UI Mockup */}
        <div className="lg:col-span-7 w-full z-10">
          <div className="relative rounded-2xl border border-border/80 bg-surface shadow-md overflow-hidden aspect-[16/10] flex flex-col">
            {/* Browser Header Bar */}
            <div className="bg-surface-raised border-b border-border/80 px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5 shrink-0">
                <span className="h-3 w-3 rounded-full bg-danger/70" />
                <span className="h-3 w-3 rounded-full bg-warning/70" />
                <span className="h-3 w-3 rounded-full bg-success/70" />
              </div>
              <div className="bg-surface border border-border/60 rounded-md px-3 py-1 text-[11px] text-text-secondary font-mono flex items-center justify-center w-full max-w-[260px] mx-auto select-none gap-1">
                <span>helix.internal/inbox</span>
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden text-left bg-surface">
              {/* App Sidebar (Col: 1) */}
              <div className="col-span-1 bg-surface-raised border-r border-border/40 py-4 flex flex-col items-center justify-between">
                <div className="flex flex-col gap-5">
                  <div className="h-7 w-7 rounded bg-accent/15 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                    H
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="h-4 w-4 rounded-sm bg-accent/20" />
                    <span className="h-4 w-4 rounded-sm bg-border" />
                    <span className="h-4 w-4 rounded-sm bg-border" />
                  </div>
                </div>
                <div className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-semibold">
                  JD
                </div>
              </div>

              {/* Tickets Inbox (Col: 4) */}
              <div className="col-span-4 border-r border-border/40 flex flex-col bg-surface-raised">
                <div className="p-3 border-b border-border/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">Inbox</span>
                  <span className="bg-accent/15 text-accent text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    3 Open
                  </span>
                </div>
                <div className="flex-1 flex flex-col">
                  {/* Ticket 1 (Urgent Selected) */}
                  <div className="p-3 border-l-2 border-l-danger bg-accent/5 border-b border-border/30 flex flex-col gap-1.5 select-none">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-text-primary truncate">API Timeout Issues</span>
                      <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-danger/10 text-danger shrink-0">Urgent</span>
                    </div>
                    <p className="text-[10px] text-text-secondary truncate">Checkout failing on production</p>
                    <div className="flex items-center justify-between text-[9px] text-text-secondary">
                      <span>Stripe Inc.</span>
                      <span className="text-danger flex items-center gap-0.5 font-mono"><Clock size={10} /> 4 min</span>
                    </div>
                  </div>

                  {/* Ticket 2 (High) */}
                  <div className="p-3 border-l-2 border-l-warning border-b border-border/30 flex flex-col gap-1.5 select-none opacity-85 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-text-primary truncate">Billing Sync Discrepancy</span>
                      <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-warning/10 text-warning shrink-0">High</span>
                    </div>
                    <p className="text-[10px] text-text-secondary truncate">Invoice amounts mismatching CRM</p>
                    <div className="flex items-center justify-between text-[9px] text-text-secondary">
                      <span>Clara Oswald</span>
                      <span className="text-warning flex items-center gap-0.5 font-mono"><Clock size={10} /> 25 min</span>
                    </div>
                  </div>

                  {/* Ticket 3 (Medium) */}
                  <div className="p-3 border-l-2 border-l-info border-b border-border/30 flex flex-col gap-1.5 select-none opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-text-primary truncate">Update Billing Cycle</span>
                      <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-info/10 text-info shrink-0">Medium</span>
                    </div>
                    <p className="text-[10px] text-text-secondary truncate">Change invoice date to 1st of month</p>
                    <div className="flex items-center justify-between text-[9px] text-text-secondary">
                      <span>Danny Pink</span>
                      <span className="text-text-secondary flex items-center gap-0.5 font-mono"><Clock size={10} /> 2h due</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Detail & Thread (Col: 7) */}
              <div className="col-span-7 flex flex-col bg-surface p-3 gap-3 overflow-hidden">
                {/* Header detail */}
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div>
                    <h2 className="text-xs font-bold text-text-primary truncate">API Timeout Issues</h2>
                    <p className="text-[10px] text-text-secondary">Customer: developer@stripe.com</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 text-[9px] font-semibold rounded bg-info/15 text-info uppercase">Open</span>
                    <span className="px-2 py-0.5 text-[9px] font-semibold rounded bg-surface-raised border border-border/60 text-text-secondary">Assign Agent</span>
                  </div>
                </div>

                {/* Message list */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                  {/* Customer Message */}
                  <div className="bg-surface-raised border border-border/40 rounded-lg p-2.5 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-text-primary">developer@stripe.com</span>
                      <span className="text-[9px] text-text-secondary">3 min ago</span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      We are experiencing recurring timeouts (HTTP 504) when hitting the webhook delivery endpoint. This is causing critical checkout failures on production. Please assist immediately.
                    </p>
                  </div>

                  {/* Internal Agent Note */}
                  <div className="bg-surface-internal-note border border-warning/20 rounded-lg p-2.5 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-warning flex items-center gap-1">
                        🔒 Internal Note (Agents only)
                      </span>
                      <span className="text-[9px] text-text-secondary">Just now</span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      Checked Cloudwatch logs, DB connection pool is saturated at 100%. Escalating this to the DevOps/SRE team.
                    </p>
                  </div>
                </div>

                {/* Quick actions box */}
                <div className="mt-auto border-t border-border/40 pt-2 flex flex-col gap-2">
                  <div className="bg-surface-raised border border-border/60 rounded px-2 py-1.5 text-[10px] text-text-muted select-none flex items-center justify-between">
                    <span>Reply to customer or write note...</span>
                    <span className="text-[9px] bg-border px-1.5 py-0.5 rounded text-text-secondary font-mono">⌘Enter</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="px-2 py-1 bg-surface-raised border border-border/60 text-[9px] font-semibold rounded text-text-secondary hover:text-text-primary select-none cursor-pointer">
                        Macro
                      </span>
                      <span className="px-2 py-1 bg-surface-raised border border-border/60 text-[9px] font-semibold rounded text-text-secondary hover:text-text-primary select-none cursor-pointer">
                        Internal Note
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-accent hover:bg-accent-hover text-white text-[10px] font-bold rounded shadow-xs select-none cursor-pointer">
                      Send Reply
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlaid Float Cards */}
            {/* Card 1: Escalation Triggered */}
            <div className="absolute bottom-16 left-28 bg-surface-overlay border border-border rounded-lg shadow-md p-3 max-w-[200px] flex flex-col gap-2 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent">
                <Zap size={12} />
                <span>Atomic Escalation</span>
              </div>
              <p className="text-[9px] text-text-secondary">Transferring ownership to **DevOps Team** with current context.</p>
              <div className="flex justify-end gap-1.5">
                <span className="px-1.5 py-0.5 bg-surface-raised border border-border text-[8px] font-semibold rounded text-text-secondary">Cancel</span>
                <span className="px-1.5 py-0.5 bg-accent text-white text-[8px] font-semibold rounded">Confirm</span>
              </div>
            </div>

            {/* Card 2: Workload distribution */}
            <div className="absolute top-16 right-6 bg-surface-overlay border border-border/80 rounded-lg shadow-xs p-2.5 select-none animate-in fade-in duration-300">
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Live SLA Risk</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 bg-border/40 rounded-full overflow-hidden">
                  <div className="h-full w-[90%] bg-danger" />
                </div>
                <span className="text-[10px] font-bold text-danger">90% Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
