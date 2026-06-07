"use client"

import Link from "next/link"
import { HelpCircle, ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
      <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6 border border-accent/20">
        <HelpCircle size={32} />
      </div>
      
      <h2 className="text-xl font-bold text-text-primary tracking-tight md:text-2xl mb-2">
        Page Not Found
      </h2>
      
      <p className="text-sm text-text-secondary max-w-sm mb-8 leading-relaxed">
        The route you are trying to access does not exist or has been moved.
      </p>

      <Link
        href="/inbox"
        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-text-primary font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-md shadow-accent/15 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
      >
        <span>Go to Workspace</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}
