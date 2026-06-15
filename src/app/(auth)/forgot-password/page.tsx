"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/browser"
import { Mail, Loader2, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    setIsLoading(true)

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: origin ? `${origin}/set-password` : undefined,
      })

      if (resetError) throw resetError

      setSuccess(true)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send reset link. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Brand Logo & Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 mb-3">
          <span className="text-xl font-bold text-text-primary tracking-wider">H</span>
        </div>
        <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Reset Password</h2>
        <p className="text-sm text-text-secondary mt-1">
          We will send you a link to recover your account
        </p>
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

      {success ? (
        <div className="text-center">
          <div className="mb-4 p-4 bg-success/10 border border-success/20 rounded-lg text-success text-sm flex items-start gap-2 text-left animate-in fade-in slide-in-from-top-1 duration-200" role="status">
            <CheckCircle className="h-5 w-5 shrink-0 text-success mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Reset Link Sent</p>
              <p className="text-text-secondary text-xs mt-1">
                Please check your email inbox at <span className="font-semibold text-text-primary">{email}</span> for a link to reset your password.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full mt-4"
            onClick={() => router.push("/login")}
          >
            Back to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                disabled={isLoading}
                className="block w-full bg-surface/50 border border-border/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full mt-6"
          >
            Send Reset Link
          </Button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors mt-4 py-2 cursor-pointer font-medium"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </button>
        </form>
      )}
    </div>
  )
}
