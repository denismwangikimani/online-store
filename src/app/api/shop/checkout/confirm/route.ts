import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(request: Request) {
  try {
    console.log("🔄 Confirm endpoint called");

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    console.log("📋 Session ID:", sessionId);

    if (!sessionId) {
      console.log("❌ No session ID provided");
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    console.log("🔍 Retrieving Stripe session...");

    // Retrieve the session from Stripe
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
      console.log("✅ Stripe session retrieved:", {
        id: stripeSession.id,
        payment_status: stripeSession.payment_status,
        metadata: stripeSession.metadata,
      });
    } catch (stripeError) {
      console.error("❌ Stripe session retrieval failed:", stripeError);
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 404 }
      );
    }

    if (!stripeSession.metadata?.orderNumber) {
      console.log("❌ No order number in session metadata");
      return NextResponse.json(
        { error: "Order information not found" },
        { status: 404 }
      );
    }

    console.log("🔍 Looking up order in database...");

    // Get the order from database using order number
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, status")
      .eq("order_number", stripeSession.metadata.orderNumber)
      .single();

    if (orderError) {
      console.error("❌ Database order lookup failed:", orderError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!order) {
      console.log("❌ Order not found in database");
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("✅ Order found:", order);

    // Only send notifications if payment was successful
    if (stripeSession.payment_status === "paid") {
      console.log("💰 Payment successful, sending notifications...");
      console.log("🎯 Order ID for notifications:", order.id);

      try {
        const notificationUrl = `${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/api/notifications/order`;

        console.log("📧 Calling notification endpoint:", notificationUrl);
        console.log("📦 Notification payload:", { orderId: order.id });

        const notificationResponse = await fetch(notificationUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId: order.id }),
        });

        console.log(
          "📡 Notification response status:",
          notificationResponse.status
        );

        if (!notificationResponse.ok) {
          const errorText = await notificationResponse.text();
          console.error("❌ Notification API error:", errorText);
        } else {
          const notificationResult = await notificationResponse.json();
          console.log("✅ Notification result:", notificationResult);
          console.log(
            "✅ Notifications sent successfully from confirm endpoint"
          );
        }
      } catch (error) {
        console.error("❌ Error sending notifications:", error);
        // Don't fail the response if notifications fail
      }
    } else {
      console.log(
        "⏳ Payment not yet completed, status:",
        stripeSession.payment_status
      );
    }

    console.log("✅ Confirm endpoint successful");

    return NextResponse.json({
      success: true,
      orderNumber: stripeSession.metadata.orderNumber,
      checkoutType: stripeSession.metadata.checkoutType || "cart",
      paymentStatus: stripeSession.payment_status,
      orderStatus: order.status,
    });
  } catch (error) {
    console.error("💥 Session confirmation error:", error);
    return NextResponse.json(
      { error: "An error occurred during confirmation" },
      { status: 500 }
    );
  }
}
