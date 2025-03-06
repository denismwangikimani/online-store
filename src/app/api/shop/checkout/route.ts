import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { randomUUID } from "crypto";

// Initialize Stripe with the correct API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
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

    const userId = session.user.id;
    const { items, checkoutType } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid items provided" },
        { status: 400 }
      );
    }

    // Generate a unique order number
    const orderNumber = `ORD-${Date.now()}-${randomUUID().substring(0, 6)}`;

    // Calculate total amount and create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.products ? item.products.name : item.name,
          images: [
            (item.products ? item.products.image_url : item.image_url) || "",
          ],
          metadata: {
            productId: item.products ? item.products.id : item.id,
            color: item.color || "",
            size: item.size || ""
          },
        },
        unit_amount: Math.round(
          (item.price || item.discounted_price || 0) * 100
        ), // Stripe uses cents
      },
      quantity: item.quantity || 1,
    }));

    const totalAmount = items.reduce(
      (sum, item) =>
        sum + (item.price || item.discounted_price || 0) * (item.quantity || 1),
      0
    );

    // Create a new Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
      metadata: {
        userId,
        orderNumber,
        checkoutType: checkoutType || "cart",
      },
    });

    // Store initial order information
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: orderNumber,
        status: "pending",
        total_amount: totalAmount,
        payment_intent_id: stripeSession.payment_intent as string,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Store order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.products ? item.products.id : item.id,
      quantity: item.quantity || 1,
      price: item.price || item.discounted_price || 0,
      color: item.color || null,
      size: item.size || null,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("Error creating order items:", orderItemsError);
      // We don't return an error here since the order has been created
      // and the Stripe session has been initialized
    }

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "An error occurred during checkout" },
      { status: 500 }
    );
  }
}