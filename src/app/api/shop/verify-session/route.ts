import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }

    // Create the Supabase client properly
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!stripeSession || stripeSession.metadata?.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Invalid or unauthorized session" },
        { status: 403 }
      );
    }

    // Update order status if needed
    if (stripeSession.payment_status === "paid") {
      const { error } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("payment_intent_id", stripeSession.payment_intent);

      if (error) {
        console.error("Error updating order status:", error);
      }
    }

    return NextResponse.json({
      orderNumber: stripeSession.metadata?.orderNumber || null,
      checkoutType: stripeSession.metadata?.checkoutType || "cart",
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    );
  }
}
