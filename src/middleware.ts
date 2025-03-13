import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  // Skip auth check for login and signup pages
  if (
    req.nextUrl.pathname === "/admin/login" ||
    req.nextUrl.pathname === "/admin/signup"
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    // Store the attempted URL to redirect back after login
    const redirectUrl = new URL("/admin/login", req.url);
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  if (!profile?.is_admin) {
    // Sign out non-admin users
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return res;
}
