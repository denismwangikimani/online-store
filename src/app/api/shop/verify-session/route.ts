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
        { error: "Invalid session metadata" },
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

      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          shipping_address: shippingAddress,
          updated_at: new Date().toISOString(),
        })
        .eq("payment_intent_id", stripeSession.payment_intent)
        .select("id")
        .single();

      if (error) {
        console.error("Error updating order status and shipping:", error);
      } else if (updatedOrder) {
        // Send notifications after successful payment and order update
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
              body: JSON.stringify({ orderId: updatedOrder.id }),
            }
          );

          if (!notificationResponse.ok) {
            console.error(
              "Notification API returned error:",
              await notificationResponse.text()
            );
          } else {
            console.log("Notifications sent successfully");
          }
        } catch (notificationError) {
          console.error("Error sending notifications:", notificationError);
          // Don't fail the response if notifications fail
        }
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
