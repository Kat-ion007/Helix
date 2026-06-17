"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

interface DemoBookingModalProps {
  open: boolean
  onClose: () => void
}

export function DemoBookingModal({ open, onClose }: DemoBookingModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [teamSize, setTeamSize] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = "Full name is required."
    if (!email.trim()) {
      newErrors.email = "Work email is required."
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid work email address."
    }
    if (!company.trim()) newErrors.company = "Company name is required."
    if (!teamSize) newErrors.teamSize = "Please select your team size."
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSuccess(true)
      setName("")
      setEmail("")
      setCompany("")
      setTeamSize("")
    }, 1200)
  }

  const handleClose = () => {
    onClose()
    // Reset state on close
    setTimeout(() => {
      setSuccess(false)
      setErrors({})
    }, 200)
  }

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="demo-booking-title">
      <Modal.Header>
        <h2 id="demo-booking-title" className="text-page-heading text-text-primary">
          Book a Demo
        </h2>
        <Modal.CloseButton aria-label="Close demo booking modal" />
      </Modal.Header>
      
      <Modal.Body>
        {success ? (
          <div className="text-center py-6 animate-in fade-in duration-300">
            <div className="h-12 w-12 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-4 text-success text-xl font-bold">
              ✓
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-2">
              Request Received!
            </h3>
            <p className="text-sm text-text-secondary">
              Thank you for your interest in Helix. A product specialist will reach out to you at your work email shortly to coordinate a demo.
            </p>
          </div>
        ) : (
          <form id="demo-booking-form" onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <p className="text-sm text-text-secondary mb-2">
              See how Helix can reduce context-switching and accelerate ticket resolution for your support team.
            </p>
            
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="demo-name" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="demo-name"
                type="text"
                placeholder="Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full bg-surface-raised border rounded px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.name ? "border-danger focus:ring-danger" : "border-border"
                }`}
              />
              {errors.name && (
                <span role="alert" className="text-xs text-danger font-medium mt-0.5">
                  {errors.name}
                </span>
              )}
            </div>

            {/* Work Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="demo-email" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Work Email
              </label>
              <input
                id="demo-email"
                type="email"
                placeholder="sarah@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-surface-raised border rounded px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.email ? "border-danger focus:ring-danger" : "border-border"
                }`}
              />
              {errors.email && (
                <span role="alert" className="text-xs text-danger font-medium mt-0.5">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Company Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="demo-company" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Company Name
              </label>
              <input
                id="demo-company"
                type="text"
                placeholder="Acme Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={`w-full bg-surface-raised border rounded px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.company ? "border-danger focus:ring-danger" : "border-border"
                }`}
              />
              {errors.company && (
                <span role="alert" className="text-xs text-danger font-medium mt-0.5">
                  {errors.company}
                </span>
              )}
            </div>

            {/* Team Size */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="demo-team-size" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Support Team Size
              </label>
              <select
                id="demo-team-size"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className={`w-full bg-surface-raised border rounded px-3 py-2 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer ${
                  errors.teamSize ? "border-danger focus:ring-danger" : "border-border"
                }`}
              >
                <option value="">Select team size...</option>
                <option value="1-10">1 to 10 agents</option>
                <option value="11-50">11 to 50 agents</option>
                <option value="51-200">51 to 200 agents</option>
                <option value="200+">200+ agents</option>
              </select>
              {errors.teamSize && (
                <span role="alert" className="text-xs text-danger font-medium mt-0.5">
                  {errors.teamSize}
                </span>
              )}
            </div>
          </form>
        )}
      </Modal.Body>

      <Modal.Footer>
        {success ? (
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="demo-booking-form"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Request Demo
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  )
}
