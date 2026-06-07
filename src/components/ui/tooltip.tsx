"use client"

import { ReactNode, useState, useId } from "react"

interface TooltipProps {
  children: ReactNode
  content: string
}

export function Tooltip({ children, content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipId = useId()

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocusCapture={() => setIsVisible(true)}
      onBlurCapture={() => setIsVisible(false)}
    >
      {/* Trigger element needs to have aria-describedby pointing to tooltipId */}
      <div aria-describedby={tooltipId} className="inline-flex">
        {children}
      </div>

      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-surface-overlay border border-border text-text-primary text-[11px] font-medium rounded shadow-lg whitespace-nowrap z-dropdown animate-in fade-in slide-in-from-bottom-1 duration-150"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] border-4 border-transparent border-t-surface-overlay" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[6px] border-4 border-transparent border-t-border -z-10" />
        </div>
      )}
    </div>
  )
}
