import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);
      console.log("Successfully exchanged code for session");
    } catch (error) {
      console.error("Error exchanging code for session:", error);
    }
  }

  // Redirect back to the home page
  return NextResponse.redirect(new URL("/", request.url));
}
