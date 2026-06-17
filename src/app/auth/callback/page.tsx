"use client"

/**
 * Auth Callback — client-side token handler
 *
 * Supabase invite / password-reset emails redirect here. There are two possible
 * token formats depending on the Supabase project's auth flow setting:
 *
 *   Implicit flow  → #access_token=...&refresh_token=...&type=invite  (hash, client-only)
 *   PKCE flow      → ?code=...                                         (query param)
 *
 * A server route.ts CANNOT read hash fragments — they are never sent to the server.
 * This client page handles both formats, establishes the session, then
 * navigates to /set-password where the user can choose their password.
 */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/browser"
import { Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"processing" | "error">("processing")
  const [errorDetail, setErrorDetail] = useState<string | null>(null)

  useEffect(() => {
    // Parse hash fragment as key=value params (hash starts with '#')
    const rawHash = window.location.hash
    const hashParams = new URLSearchParams(rawHash.startsWith("#") ? rawHash.slice(1) : "")
    const searchParams = new URLSearchParams(window.location.search)

    const code = searchParams.get("code")

    // Log the full URL for debugging
    console.info("[auth/callback] URL on load:", {
      hash: rawHash,
      search: window.location.search,
    })

    // ── Error in URL ────────────────────────────────────────────────────────
    const urlError = hashParams.get("error") || searchParams.get("error")
    const urlErrorDesc = hashParams.get("error_description") || searchParams.get("error_description")

    if (urlError) {
      console.error("[auth/callback] Supabase error:", urlError, urlErrorDesc)
      setStatus("error")
      setErrorDetail(decodeURIComponent((urlErrorDesc ?? urlError).replace(/\+/g, " ")))
      return
    }

    // ── PKCE flow: ?code= ───────────────────────────────────────────────────
    // Exchange the one-time code for a session, then redirect.
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (error) {
            console.error("[auth/callback] PKCE exchange failed:", error.message)
            setStatus("error")
            setErrorDetail(error.message)
          } else if (data.session) {
            console.info("[auth/callback] PKCE session established, redirecting")
            router.replace("/set-password")
          }
        })
      return
    }

    // ── Implicit flow: #access_token= ──────────────────────────────────────
    // createBrowserClient (@supabase/ssr) uses PKCE mode and does NOT
    // auto-detect hash tokens. We must manually call setSession().
    const accessToken = hashParams.get("access_token")
    const refreshToken = hashParams.get("refresh_token")

    if (accessToken && refreshToken) {
      console.info("[auth/callback] Implicit flow — calling setSession manually")
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data, error }) => {
          if (error) {
            console.error("[auth/callback] setSession failed:", error.message)
            setStatus("error")
            setErrorDetail(error.message)
          } else if (data.session) {
            console.info("[auth/callback] Session set, redirecting to /set-password")
            router.replace("/set-password")
          } else {
            setStatus("error")
            setErrorDetail("Session could not be established from the invite link.")
          }
        })
      return
    }

    // ── token_hash= (newer Supabase email OTP format) ──────────────────────
    const tokenHash = hashParams.get("token_hash")
    const tokenType = hashParams.get("type") as "invite" | "recovery" | null

    if (tokenHash && tokenType) {
      console.info("[auth/callback] token_hash flow — calling verifyOtp manually")
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: tokenType })
        .then(({ data, error }) => {
          if (error) {
            console.error("[auth/callback] verifyOtp failed:", error.message)
            setStatus("error")
            setErrorDetail(error.message)
          } else if (data.session) {
            console.info("[auth/callback] OTP verified, redirecting to /set-password")
            router.replace("/set-password")
          }
        })
      return
    }

    // ── No token at all ────────────────────────────────────────────────────
    // Check if user already has a session (navigated here manually).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/inbox")
        return
      }
      // No session, no token — show error after a brief wait
      console.warn("[auth/callback] No token found — full URL:", window.location.href)
      setStatus("error")
      setErrorDetail("No invite token was found in the link. It may have already been used.")
    })
  }, [router])

  if (status === "error") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-xl bg-danger/10 flex items-center justify-center mb-4 border border-danger/20">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">
            Invalid or Expired Link
          </h2>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            This invite link has already been used or has expired. Please contact
            your system administrator to request a new invitation.
          </p>
          {errorDetail && (
            <p className="mt-3 text-xs font-mono bg-surface border border-border rounded px-3 py-2 text-danger/80 text-left break-all">
              {errorDetail}
            </p>
          )}
          <Button
            variant="secondary"
            className="w-full mt-6"
            onClick={() => router.push("/login")}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="text-sm text-text-secondary">Verifying your invite link…</span>
      </div>
    </div>
  )
}
