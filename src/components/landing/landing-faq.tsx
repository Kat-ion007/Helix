"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react"

export function LandingFaq() {
  // Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const steps = [
    {
      num: "1",
      title: "Tickets Arrive",
      description: "Tickets are ingested automatically via API pipelines and loaded directly into the main inbox queue.",
    },
    {
      num: "2",
      title: "Agents Review Context",
      description: "Opening a ticket instantly reveals detailed customer profile metadata side-by-side with conversation text.",
    },
    {
      num: "3",
      title: "Respond & Update Status",
      description: "Agents use speed shortcuts or macros to reply, change status (Open, Pending, Resolved), and log changes.",
    },
    {
      num: "4",
      title: "Escalate When Needed",
      description: "If L2 support is required, agents escalate ownership atomically, preserving notes and full history context.",
    },
    {
      num: "5",
      title: "Resolve Faster",
      description: "Reduced tab-switching and quick actions cut handling loops, helping teams exceed their SLA targets.",
    },
  ]

  const faqs = [
    {
      q: "Is Helix customer-facing?",
      a: "No. Helix is strictly an internal operations platform and admin workspace used by support agents, team leads, and administrators to review and resolve tickets. It is designed to replace customer operations clutter, not act as a customer-facing help desk widget.",
    },
    {
      q: "Can Helix handle escalations?",
      a: "Yes. Helix features a structured, atomic escalation engine. Support agents can transfer ticket ownership to other teams or team leads with preloaded context, target selectors, and optional handoff notes. Ownership modifications are recorded in the audit trail in real time.",
    },
    {
      q: "Does Helix support manager reporting?",
      a: "Yes. Helix provides a live Manager Dashboard showing critical queue metrics: total open tickets, warning counts, SLA breach counters, and real-time agent workload distribution graphs (color-coded to identify overloads before they breach).",
    },
    {
      q: "Is Helix suitable for growing teams?",
      a: "Yes. Driven by Supabase Realtime, Helix pushes ticket updates, assignment changes, and message notifications to all active agents within 3 seconds, eliminating concurrent update collisions or double-handling of tickets.",
    },
  ]

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <section id="faq" className="py-16 lg:py-24 border-b border-border/40 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* SECTION 1: How It Works */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Workflow Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              How Helix Works
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              A streamlined 5-step lifecycle designed to move tickets from ingestion to resolution with zero friction.
            </p>
          </div>

          {/* Workflow Steps - Desktop Row / Mobile Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col gap-4 bg-surface-raised border border-border/60 rounded-xl p-5 relative select-none">
                <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
                  {step.num}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {/* Arrow connectors for desktop */}
                {idx < 4 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 text-border">
                    <ArrowRight size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: FAQs Accordion */}
        <div className="max-w-3xl mx-auto border-t border-border/40 pt-16">
          <div className="text-center mb-12 flex flex-col gap-4">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Answers
            </span>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-surface-raised border border-border/80 rounded-xl overflow-hidden hover:border-border transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-bold text-sm text-text-primary cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle size={16} className="text-accent" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-text-secondary transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-text-primary" : ""
                      }`}
                    />
                  </button>
                  
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs text-text-secondary border-t border-border/30 leading-relaxed bg-surface-overlay/20 animate-in fade-in slide-in-from-top-1 duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
