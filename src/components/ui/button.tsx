"use client"

import { ButtonHTMLAttributes, forwardRef } from "react"
import { Loader2 } from "lucide-react"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  intent?: "default" | "danger"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "secondary",
      intent = "default",
      size = "md",
      isLoading = false,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Base styles: spacing, layout, transitions, focus ring
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"

    // Variant and Intent combinations
    const variantStyles = {
      primary:
        intent === "danger"
          ? "bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30"
          : "bg-accent hover:bg-accent-hover text-text-primary shadow-md shadow-accent/10",
      secondary:
        intent === "danger"
          ? "bg-surface-raised border border-danger/30 hover:bg-danger/10 text-danger"
          : "bg-surface-raised border border-border/80 hover:bg-surface-overlay text-text-primary",
      ghost:
        intent === "danger"
          ? "hover:bg-danger/10 text-danger"
          : "hover:bg-surface-raised text-text-secondary hover:text-text-primary",
    }

    // Sizes
    const sizeStyles = {
      sm: "px-2.5 py-1.5 text-xs gap-1.5 h-7",
      md: "px-4 py-2 text-sm gap-2 h-9",
      lg: "px-6 py-3 text-base gap-2 h-11",
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
