"use client"

interface SkeletonProps {
  className?: string
  variant?: "text" | "avatar" | "row" | "card" | "paragraph"
}

export function Skeleton({ className = "", variant }: SkeletonProps) {
  const base = "animate-pulse bg-border/40 rounded"

  if (variant === "text") {
    return <div className={`${base} h-3 w-24 ${className}`} />
  }

  if (variant === "avatar") {
    return <div className={`${base} h-8 w-8 rounded-full ${className}`} />
  }

  if (variant === "row") {
    return <div className={`${base} h-12 w-full ${className}`} />
  }

  if (variant === "card") {
    return <div className={`${base} h-24 w-full rounded-lg ${className}`} />
  }

  if (variant === "paragraph") {
    return (
      <div className={`space-y-2.5 ${className}`}>
        <div className={`${base} h-3.5 w-full`} />
        <div className={`${base} h-3.5 w-[90%]`} />
        <div className={`${base} h-3.5 w-[75%]`} />
      </div>
    )
  }

  return <div className={`${base} ${className}`} />
}
