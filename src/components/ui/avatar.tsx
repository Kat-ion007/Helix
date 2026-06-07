"use client"

import { useMemo } from "react"

interface AvatarProps {
  src?: string | null
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  }

  const initials = useMemo(() => {
    if (!name) return ""
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }, [name])

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full bg-accent text-text-primary font-semibold select-none overflow-hidden ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // If image fails to load, clear src to fallback to initials
            ;(e.currentTarget as HTMLImageElement).style.display = "none"
          }}
        />
      ) : null}
      <span className={src ? "sr-only" : ""}>{initials}</span>
    </div>
  )
}
