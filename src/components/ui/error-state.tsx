"use client"

import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "./button"

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-danger/5 rounded-xl border border-danger/20 max-w-lg mx-auto my-8 animate-in fade-in duration-200">
      <div className="h-12 w-12 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-4">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1.5">Something went wrong</h3>
      <p className="text-sm text-text-secondary leading-normal max-w-xs mb-5">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} size="sm" className="gap-1.5">
          <RotateCcw size={14} />
          Try Again
        </Button>
      )}
    </div>
  )
}
