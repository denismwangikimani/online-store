import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies(); // Make sure to await cookies
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Simply fetch all customer profiles without admin check for now
    const { data: customers, error } = await supabase
      .from("customer_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}