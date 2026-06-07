"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[GlobalError] Unhandled crash caught by error boundary:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
      <div className="h-16 w-16 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-6 border border-danger/20">
        <AlertTriangle size={32} />
      </div>
      
      <h2 className="text-xl font-bold text-text-primary tracking-tight md:text-2xl mb-2">
        Helix Workspace crashed
      </h2>
      
      <p className="text-sm text-text-secondary max-w-sm mb-8 leading-relaxed">
        An unexpected application error occurred. Click reload to restore the session.
      </p>

      <div className="flex gap-4 justify-center">
        <Button
          variant="primary"
          onClick={() => {
            // Force fully reload page to recover state
            window.location.reload()
          }}
          className="font-semibold text-xs uppercase tracking-wider"
        >
          Reload Page
        </Button>
        
        <Button
          variant="secondary"
          onClick={reset}
          className="gap-1.5 font-semibold text-xs uppercase tracking-wider"
        >
          <RotateCcw size={14} />
          Reset State
        </Button>
      </div>
    </div>
  )
}
