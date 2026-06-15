/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/supabase";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isForgotPasswordPage = request.nextUrl.pathname === "/forgot-password";
  const isAuthPage = request.nextUrl.pathname === "/" || isLoginPage || isForgotPasswordPage;
  const isSetPasswordPage = request.nextUrl.pathname === "/set-password";

  // Authenticate user against Supabase Auth service (GetUser is more secure than GetSession)
  let user;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (err) {
    console.error("[Middleware] Auth getUser() failed:", err);
    if (!isAuthPage && !isSetPasswordPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 1. Unauthenticated users: redirect to /login
  if (!user && !isAuthPage && !isSetPasswordPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2. Authenticated users trying to access login/landing: redirect to /inbox
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/inbox";
    return NextResponse.redirect(url);
  }

  // 3. Role-based route guards and status checks
  if (user) {
    let profile;
    try {
      const result = await (supabase.from("user") as any)
        .select("role, status")
        .eq("id", user.id)
        .single();
      profile = result.data;
    } catch (err) {
      console.error("[Middleware] Failed to fetch user profile:", err);
      return supabaseResponse;
    }

    // 3a. Check if account is inactive
    if (profile && profile.status === "inactive") {
      if (!isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("error", "inactive");
        
        const response = NextResponse.redirect(url);
        // Clear session cookies
        response.cookies.delete("sb-access-token");
        response.cookies.delete("sb-refresh-token");
        return response;
      }
      // Bypasses redirect to /inbox if they are already on /login
      return supabaseResponse;
    }

    // Guard /dashboard: leads or admins only
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      if (!profile || !["lead", "admin"].includes(profile.role)) {
        const url = request.nextUrl.clone();
        url.pathname = "/inbox";
        return NextResponse.redirect(url);
      }
    }

    // Guard /settings: admins only
    if (request.nextUrl.pathname.startsWith("/settings")) {
      if (!profile || profile.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/inbox";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
