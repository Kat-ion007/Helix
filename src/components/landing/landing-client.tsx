"use client"

import { useState } from "react"
import { LandingNav } from "./landing-nav"
import { LandingHero } from "./landing-hero"
import { LandingProblems } from "./landing-problems"
import { LandingFeatures } from "./landing-features"
import { LandingBenefits } from "./landing-benefits"
import { LandingShowcase } from "./landing-showcase"
import { LandingFaq } from "./landing-faq"
import { LandingCta } from "./landing-cta"
import { LandingFooter } from "./landing-footer"
import { DemoBookingModal } from "./demo-booking-modal"

export function LandingClient() {
  const [demoOpen, setDemoOpen] = useState(false)

  const handleOpenDemo = () => setDemoOpen(true)
  const handleCloseDemo = () => setDemoOpen(false)

  return (
    <div className="min-h-screen flex flex-col bg-surface text-text-primary">
      <LandingNav onBookDemo={handleOpenDemo} />
      
      <main id="main-content" className="flex-1 focus:outline-none">
        <LandingHero onBookDemo={handleOpenDemo} />
        <LandingProblems />
        <LandingFeatures />
        <LandingBenefits />
        <LandingShowcase />
        <LandingFaq />
        <LandingCta onBookDemo={handleOpenDemo} />
      </main>

      <LandingFooter />
      
      <DemoBookingModal open={demoOpen} onClose={handleCloseDemo} />
    </div>
  )
}
