"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingNavProps {
  onBookDemo: () => void
}

export function LandingNav({ onBookDemo }: LandingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Solutions", href: "#solutions" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ]

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="sticky top-0 z-sticky w-full border-b border-border/60 bg-surface/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 text-text-primary font-bold text-lg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent rounded-md px-1"
        >
          <div className="bg-accent text-black font-extrabold w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 select-none">
            H
          </div>
          <span>Helix</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="hover:text-text-primary hover:underline underline-offset-4 decoration-accent/60 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface outline-none cursor-pointer hover:bg-surface-raised text-text-secondary hover:text-text-primary px-4 py-2 text-sm gap-2 h-9"
          >
            View Product Walkthrough
          </Link>
          <Button variant="primary" className="text-sm font-semibold" onClick={onBookDemo}>
            Book a Demo
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 -mr-2 text-text-secondary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 border-b border-border/80 bg-surface-raised shadow-xl p-6 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4 text-base font-semibold text-text-secondary">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className="py-1.5 hover:text-text-primary transition-colors block border-b border-border/30"
              >
                {link.name}
              </a>
            ))}
          </nav>
          
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface outline-none cursor-pointer bg-surface-raised border border-border/80 hover:bg-surface-overlay text-text-primary w-full justify-center text-sm py-2.5 h-11"
            >
              View Product Walkthrough
            </Link>
            <Button variant="primary" className="w-full justify-center text-sm font-semibold py-2.5 h-11" onClick={() => { setMobileMenuOpen(false); onBookDemo(); }}>
              Book a Demo
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
