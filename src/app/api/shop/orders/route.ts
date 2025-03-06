import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Create the Supabase client properly
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get orders for the current user
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching orders" },
      { status: 500 }
    );
  }
}
