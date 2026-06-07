"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/browser"
import { useUserStore } from "@/store/user-store"
import { AppShell } from "@/components/layout/app-shell"
import { Loader2 } from "lucide-react"

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const setProfile = useUserStore((state) => state.setProfile)
  const profile = useUserStore((state) => state.profile)
  const [loading, setLoading] = useState(!profile)

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          throw new Error("Unauthorized")
        }

        const { data: userProfile, error: dbError } = await (supabase.from("user") as any)
          .select("id, name, email, role, created_at")
          .eq("id", user.id)
          .single()

        if (dbError || !userProfile) {
          throw new Error("Failed to load user profile")
        }

        if (active) {
          setProfile({
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            role: userProfile.role,
          })
          setLoading(false)
        }
      } catch (err) {
        console.error("[AppLayout] Auth error:", err)
        if (active) {
          setProfile(null)
          router.push("/login")
        }
      }
    }

    if (!profile) {
      loadProfile()
    }

    // Set up auth state change listener to redirect on SIGNED_OUT
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === "SIGNED_OUT") {
        setProfile(null)
        router.push("/login")
        router.refresh()
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [router, setProfile, profile])

  if (loading) {
    return (
      <div
        className="min-h-screen w-screen bg-surface flex flex-col items-center justify-center gap-3 text-text-secondary"
        aria-live="polite"
      >
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="text-sm font-medium">Initializing workspace...</span>
      </div>
    )
  }

  return <AppShell>{children}</AppShell>
}
