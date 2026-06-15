"use client"

export const dynamic = "force-dynamic"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/browser"
import { Lock, Mail, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const successParam = searchParams.get("success")
  const success = successParam === "password-set" ? "Password created successfully. You can now log in." : null
  const error = localError || (errorParam === "inactive" ? "Your account has been deactivated. Please contact an administrator." : null)
  const emailError = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!email.trim() || !password.trim()) {
      setLocalError("Fields cannot be empty")
      return
    }

    setIsLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      router.push("/inbox")
      router.refresh()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      setLocalError(errorMessage)
      setIsLoading(false)
    }
  }

  const fillCredentials = (roleEmail: string) => {
    setEmail(roleEmail)
    setPassword("kation25")
  }

  return (
    <div className="w-full">
      {/* Brand Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 mb-3">
          <span className="text-xl font-bold text-text-primary tracking-wider">H</span>
        </div>
        <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Welcome to Helix</h2>
        <p className="text-sm text-text-secondary mt-1">High-speed customer support admin panel</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg text-success text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200" role="status">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200" role="alert">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${email ? "text-[var(--color-neutral-2-500)]" : "text-text-muted"}`}>
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setLocalError(null)}
              placeholder="agent@helix.com"
              className={`block w-full ${email ? "bg-[#e8f0fe]" : "bg-surface/50"} border border-[var(--color-neutral-2-50)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:shadow-[0_2px_8px_color-mix(in_srgb,var(--color-primary-500)_15%,transparent)] focus:border-transparent transition-all`}
              suppressHydrationWarning
            />
          </div>
          {emailError && (
            <p className="mt-1.5 text-xs text-danger" role="alert">Enter a valid email address</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${password ? "text-[var(--color-neutral-2-500)]" : "text-text-muted"}`}>
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setLocalError(null)}
              placeholder="••••••••"
              className={`block w-full ${password ? "bg-[#e8f0fe]" : "bg-surface/50"} border border-[var(--color-neutral-2-50)] rounded-lg pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:shadow-[0_2px_8px_color-mix(in_srgb,var(--color-primary-500)_15%,transparent)] focus:border-transparent transition-all`}
              suppressHydrationWarning
            />
            {password.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary cursor-pointer focus:outline-none focus:text-accent"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
          <div className="flex justify-end mt-2">
            <Link
              href="/forgot-password"
              className="text-xs text-accent hover:text-accent-hover transition-colors font-medium cursor-pointer"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-text-primary font-medium text-sm py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-raised disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 shadow-md shadow-accent/10 mt-6"
          suppressHydrationWarning
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Dev Environment Helpers */}
      <div className="mt-8 pt-6 border-t border-border/50">
        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 text-center">
          Quick-Fill Test Credentials
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => fillCredentials("agent@helix.com")}
            className="px-2 py-1.5 text-xs text-center border border-border/50 rounded bg-[var(--color-background-600)] text-text-secondary hover:text-text-primary hover:bg-[var(--color-background-600)] transition-colors"
            suppressHydrationWarning
          >
            Agent
          </button>
          <button
            onClick={() => fillCredentials("lead@helix.com")}
            className="px-2 py-1.5 text-xs text-center border border-border/50 rounded bg-[var(--color-background-600)] text-text-secondary hover:text-text-primary hover:bg-[var(--color-background-600)] transition-colors"
            suppressHydrationWarning
          >
            Lead
          </button>
          <button
            onClick={() => fillCredentials("admin@helix.com")}
            className="px-2 py-1.5 text-xs text-center border border-border/50 rounded bg-[var(--color-background-600)] text-text-secondary hover:text-text-primary hover:bg-[var(--color-background-600)] transition-colors"
            suppressHydrationWarning
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
          <span className="text-sm text-text-secondary">Loading Helix...</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
