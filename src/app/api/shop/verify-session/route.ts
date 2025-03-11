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
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "shipping_details"],
    });

    if (!stripeSession || stripeSession.metadata?.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Invalid or unauthorized session" },
        { status: 403 }
      );
    }

    // Extract shipping details from Stripe
    const shippingDetails = stripeSession.shipping_details;

    // Update order with shipping details from Stripe if available
    if (stripeSession.payment_status === "paid" && shippingDetails) {
      const shippingAddress = {
        name: shippingDetails.name,
        phone: shippingDetails.phone,
        line1: shippingDetails.address?.line1,
        line2: shippingDetails.address?.line2 || null,
        city: shippingDetails.address?.city,
        state: shippingDetails.address?.state,
        postal_code: shippingDetails.address?.postal_code,
        country: shippingDetails.address?.country,
      };

      const { error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          shipping_address: shippingAddress,
          updated_at: new Date().toISOString(),
        })
        .eq("payment_intent_id", stripeSession.payment_intent);

      if (error) {
        console.error("Error updating order status and shipping:", error);
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
