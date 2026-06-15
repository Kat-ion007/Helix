/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server"
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { Database } from "@/types/supabase"

function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op
        },
      },
    }
  )
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify requesting user is an active admin
    const { data: profile, error: profileError } = await (supabase.from("user") as any)
      .select("role, status")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || profile.role !== "admin" || profile.status !== "active") {
      return NextResponse.json({ error: "Forbidden — active admin role required" }, { status: 403 })
    }

    const { name, email, role } = await request.json()

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const origin = request.headers.get("origin")

    // 1. Invite user in Supabase Auth
    const { data: authUser, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { name },
      redirectTo: origin ? `${origin}/set-password` : undefined
    })

    if (inviteError) throw inviteError

    // 2. Insert profile into public.user table
    const { data: newProfile, error: dbError } = await (adminClient
      .from("user") as any)
      .insert({
        id: authUser.user.id,
        name,
        email,
        role,
        status: "active"
      })
      .select()
      .single()

    if (dbError) {
      // Clean up auth user if DB insert fails
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      throw dbError
    }

    return NextResponse.json(newProfile)
  } catch (err: any) {
    console.error("[POST /api/admin/users] Error:", err)
    return NextResponse.json({ error: err.message || "Failed to send invitation" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify requesting user is an active admin
    const { data: profile, error: profileError } = await (supabase.from("user") as any)
      .select("role, status")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || profile.role !== "admin" || profile.status !== "active") {
      return NextResponse.json({ error: "Forbidden — active admin role required" }, { status: 403 })
    }

    const { id: targetId, name, email, role, status } = await request.json()

    if (!targetId) {
      return NextResponse.json({ error: "Target User ID is required" }, { status: 400 })
    }

    // Admins cannot deactivate or modify themselves through this endpoint
    if (targetId === user.id) {
      return NextResponse.json({ error: "Cannot modify your own account through this endpoint" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 1. Update Auth user details if email/name changes
    const authUpdates: any = {}
    if (email) authUpdates.email = email
    if (name) authUpdates.user_metadata = { name }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(
        targetId,
        authUpdates
      )
      if (authUpdateError) throw authUpdateError
    }

    // 2. Update public.user profile
    const dbUpdates: any = {}
    if (name) dbUpdates.name = name
    if (email) dbUpdates.email = email
    if (role) dbUpdates.role = role
    if (status) dbUpdates.status = status

    const { data: updatedProfile, error: dbError } = await (adminClient
      .from("user") as any)
      .update(dbUpdates)
      .eq("id", targetId)
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json(updatedProfile)
  } catch (err: any) {
    console.error("[PATCH /api/admin/users] Error:", err)
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 })
  }
}
