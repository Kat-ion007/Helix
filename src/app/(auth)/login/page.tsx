"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/browser"
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

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
      setError(errorMessage)
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@helix.com"
              className="block w-full bg-surface/50 border border-border/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              suppressHydrationWarning
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full bg-surface/50 border border-border/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              suppressHydrationWarning
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-text-primary font-medium text-sm py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-raised disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-accent/10 mt-6"
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
              <ArrowRight className="h-4 w-4" />
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
            className="px-2 py-1.5 text-xs text-center border border-border/50 rounded bg-surface/30 text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors"
            suppressHydrationWarning
          >
            Agent
          </button>
          <button
            onClick={() => fillCredentials("lead@helix.com")}
            className="px-2 py-1.5 text-xs text-center border border-border/50 rounded bg-surface/30 text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors"
            suppressHydrationWarning
          >
            Lead
          </button>
          <button
            onClick={() => fillCredentials("admin@helix.com")}
            className="px-2 py-1.5 text-xs text-center border border-border/50 rounded bg-surface/30 text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors"
            suppressHydrationWarning
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  )
}
