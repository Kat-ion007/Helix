"use client"

import { Database, ZapOff, EyeOff, AlertTriangle } from "lucide-react"

export function LandingProblems() {
  const challenges = [
    {
      icon: Database,
      title: "Scattered Customer Context",
      description: "Agents constantly switch tabs between CRM tools, databases, and billing dashboards, leading to high cognitive load and slow support flows.",
      iconColor: "text-accent bg-accent/10 border-accent/20",
    },
    {
      icon: ZapOff,
      title: "Slow Ticket Resolution",
      description: "Without quick replies, macro injection, and unified customer states, resolving even simple repeat tickets requires repetitive copy-pasting.",
      iconColor: "text-warning bg-warning/10 border-warning/20",
    },
    {
      icon: EyeOff,
      title: "Workload Blindspots",
      description: "Managers lack real-time visibility into workload distribution and queues, making it hard to prevent agent burnout and SLA breaches.",
      iconColor: "text-danger bg-danger/10 border-danger/20",
    },
    {
      icon: AlertTriangle,
      title: "Missed Escalations",
      description: "Escalated tickets get lost in messy slack channels or manual handoffs, losing context, timestamps, and accountability along the way.",
      iconColor: "text-escalated bg-escalated/10 border-escalated/20",
    },
  ]

  return (
    <section id="solutions" className="py-16 lg:py-24 border-b border-border/40 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header info */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Operational Challenges
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Why Support Teams Slow Down
          </h2>
          <p className="text-sm sm:text-base text-text-secondary">
            Context switching is the single greatest bottleneck in customer operations. Every second spent searching for info is a second your customer waits.
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {challenges.map((challenge, idx) => {
            const Icon = challenge.icon
            return (
              <div
                key={idx}
                className="bg-surface-raised border border-border/80 rounded-xl p-6 shadow-xs flex flex-col gap-4 hover:border-border transition-colors group select-none"
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center border shrink-0 ${challenge.iconColor}`}>
                  <Icon size={20} />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {challenge.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
