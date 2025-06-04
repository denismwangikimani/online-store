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
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Retrieve the session from Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!stripeSession.metadata?.orderNumber) {
      return NextResponse.json(
        { error: "Order information not found" },
        { status: 404 }
      );
    }

    // Get the order from database using order number
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, status")
      .eq("order_number", stripeSession.metadata.orderNumber)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only send notifications if payment was successful
    if (stripeSession.payment_status === "paid") {
      try {
        const notificationResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          }/api/notifications/order`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId: order.id }),
          }
        );

        if (!notificationResponse.ok) {
          console.error(
            "Notification API returned error:",
            await notificationResponse.text()
          );
        } else {
          console.log("Notifications sent successfully from confirm endpoint");
        }
      } catch (error) {
        console.error("Error sending notifications:", error);
        // Don't fail the response if notifications fail
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: stripeSession.metadata.orderNumber,
      checkoutType: stripeSession.metadata.checkoutType || "cart",
      paymentStatus: stripeSession.payment_status,
      orderStatus: order.status,
    });
  } catch (error) {
    console.error("Session confirmation error:", error);
    return NextResponse.json(
      { error: "An error occurred during confirmation" },
      { status: 500 }
    );
  }
}
