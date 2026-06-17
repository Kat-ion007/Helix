"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Mail } from "lucide-react"

interface LandingCtaProps {
  onBookDemo: () => void
}

export function LandingCta({ onBookDemo }: LandingCtaProps) {
  return (
    <section id="contact" className="py-16 lg:py-24 border-b border-border/40 bg-linear-to-b from-surface to-surface-raised relative overflow-hidden">
      {/* Background visual element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-8 relative z-10">
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          Get Started
        </span>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight leading-tight select-none">
          Ready to Streamline Your Support Operations?
        </h2>
        
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl">
          Empower your support agents with the fastest path to resolution, eliminate ticket-handling context switching, and maintain full SLA visibility in real time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto text-sm font-semibold"
            onClick={onBookDemo}
          >
            Book a Demo
            <ArrowRight size={16} />
          </Button>
          
          <a href="mailto:operations@helix.io" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto text-sm font-semibold"
            >
              <Mail size={16} />
              Contact Us
            </Button>
          </a>
        </div>

        {/* Mini stats or info row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-[11px] text-text-secondary pt-6 border-t border-border/40 w-full mt-4">
          <span className="flex items-center gap-1.5">
            ✓ No self-service credit cards
          </span>
          <span className="flex items-center gap-1.5">
            ✓ Direct enterprise integration onboarding
          </span>
          <span className="flex items-center gap-1.5">
            ✓ Dedicated SLA support representatives
          </span>
        </div>
      </div>
    </section>
  )
}
