"use client"

import { Clock, CheckSquare, Zap, BarChart3 } from "lucide-react"

export function LandingBenefits() {
  const benefits = [
    {
      metric: "-25%",
      label: "Ticket Resolution Times",
      description: "By eliminating the need to toggle between external admin consoles, database tools, and customer tabs, agents resolve tickets much faster.",
      icon: Clock,
      color: "text-accent border-accent/20 bg-accent/5",
    },
    {
      metric: "+20%",
      label: "SLA Compliance Rate",
      description: "Visual, color-coded SLA timers ensure urgent issues are addressed first. Managers get automatic warning flags before breaches occur.",
      icon: CheckSquare,
      color: "text-success border-success/20 bg-success/5",
    },
    {
      metric: "+15%",
      label: "Agent Throughput",
      description: "Speed-oriented keyboard shortcuts and ready-to-inject reply templates (macros) streamline operations, letting agents handle more tickets per hour.",
      icon: Zap,
      color: "text-warning border-warning/20 bg-warning/5",
    },
    {
      metric: "100%",
      label: "Operational Visibility",
      description: "Real-time updates synchronize queues instantly, while manager dashboard aggregates workload data so leads can make smart assignments on the fly.",
      icon: BarChart3,
      color: "text-danger border-danger/20 bg-danger/5",
    },
  ]

  return (
    <section className="py-16 lg:py-24 border-b border-border/40 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header information */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Helix Outcomes
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Designed for Measurable Results
          </h2>
          <p className="text-sm sm:text-base text-text-secondary">
            Helix matches speed with structural control. The result is a highly efficient, reliable support operation with zero visibility gaps.
          </p>
        </div>

        {/* Benefits Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon
            return (
              <div
                key={idx}
                className="bg-surface-raised border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[260px] group hover:border-border transition-colors select-none"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-black text-text-primary tracking-tight">
                      {benefit.metric}
                    </div>
                    <div className={`h-8 w-8 rounded-lg border flex items-center justify-center ${benefit.color}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                      {benefit.label}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
