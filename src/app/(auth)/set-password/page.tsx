"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/browser"
import { Lock, Loader2, AlertTriangle, CheckCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : ""
    const query = typeof window !== "undefined" ? window.location.search : ""
    const searchParams = new URLSearchParams(query)
    const hasToken =
      hash.includes("access_token") ||
      hash.includes("type=invite") ||
      hash.includes("type=recovery") ||
      searchParams.has("code")

    // Check initial session using safe dot notation to ensure full inference
    supabase.auth.getSession().then((result: { data: { session: Session | null } }) => {
      const session = result.data?.session
      if (session) {
        if (!hasToken) {
          // If already logged in but not from a redirect token, redirect to home/inbox
          router.push("/inbox")
        } else {
          setHasSession(true)
        }
      } else {
        // Wait a brief moment to process the hash fragment if the user was just redirected from email
        const timer = setTimeout(() => {
          supabase.auth.getSession().then((retryResult: { data: { session: Session | null } }) => {
            const retrySession = retryResult.data?.session
            if (retrySession && !hasToken) {
              router.push("/inbox")
            } else {
              setHasSession(!!retrySession)
            }
          })
        }, 1200)
        return () => clearTimeout(timer)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (session) {
        if (!hasToken) {
          router.push("/inbox")
        } else {
          setHasSession(true)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      // Sign out to clear the temporary invite session and redirect
      await supabase.auth.signOut()
      router.push("/login?success=password-set")
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to set password. Please try again."
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  // Loading state while checking link session
  if (hasSession === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[300px]" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-accent mb-3" />
        <span className="text-sm text-text-secondary">Validating link...</span>
      </div>
    )
  }

  // Invalid or expired link state
  if (hasSession === false) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="h-12 w-12 rounded-xl bg-danger/10 flex items-center justify-center mb-4 text-danger border border-danger/20">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary tracking-tight text-center">
          Invalid or Expired Link
        </h2>
        <p className="text-sm text-text-secondary mt-2 text-center leading-relaxed">
          The link is invalid or has expired. Please contact your system administrator or request a new verification email.
        </p>
        <Button
          variant="secondary"
          className="w-full mt-6"
          onClick={() => router.push("/login")}
        >
          Back to Sign In
        </Button>
      </div>
    )
  }

  // Active password setup form
  return (
    <div className="w-full">
      {/* Brand Logo & Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 mb-3">
          <span className="text-xl font-bold text-text-primary tracking-wider">H</span>
        </div>
        <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Create Password</h2>
        <p className="text-sm text-text-secondary mt-1">Please set a secure password for your account</p>
      </div>

      {error && (
        <div
          className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
          role="alert"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              disabled={isLoading}
              className="block w-full bg-surface/50 border border-border/80 rounded-lg pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              required
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
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="confirm-password"
              name="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              disabled={isLoading}
              className="block w-full bg-surface/50 border border-border/80 rounded-lg pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              required
            />
            {confirmPassword.length > 0 && (
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary cursor-pointer focus:outline-none focus:text-accent"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full mt-6"
        >
          Set Password
        </Button>
      </form>
    </div>
  )
}
