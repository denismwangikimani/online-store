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
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { items, checkoutType, shippingDetails } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid items provided" },
        { status: 400 }
      );
    }

    // Validate shipping details
    if (
      !shippingDetails ||
      !shippingDetails.name ||
      !shippingDetails.phone ||
      !shippingDetails.address
    ) {
      return NextResponse.json(
        { error: "Shipping details are required" },
        { status: 400 }
      );
    }

    // Fetch customer profile for any saved details
    const { data: customerProfile } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("id", userId)
      .single();

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
            size: item.size || "",
            category: item.products
              ? item.products.category
              : item.category || "",
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
      payment_method_types: [
        "card",
      ] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "KE"],
      },
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        userId,
        orderNumber,
        checkoutType: checkoutType || "cart",
        customerName: customerProfile?.first_name
          ? `${customerProfile.first_name} ${customerProfile.last_name || ""}`
          : shippingDetails.name,
        customerEmail: session.user.email ?? "", // Add null check
        customerPhone: shippingDetails.phone,
      },
    });

    // Format shipping address data
    const shippingAddressData = {
      name: shippingDetails.name,
      phone: shippingDetails.phone,
      line1: shippingDetails.address.line1,
      line2: shippingDetails.address.line2 || null,
      city: shippingDetails.address.city,
      state: shippingDetails.address.state,
      postal_code: shippingDetails.address.postal_code,
      country: shippingDetails.address.country,
    };

    // Store initial order information
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: orderNumber,
        status: "pending",
        total_amount: totalAmount,
        payment_intent_id: stripeSession.payment_intent as string,
        shipping_address: shippingAddressData,
        // Optional billing address if different from shipping
        billing_address: shippingDetails.billingAddress || shippingAddressData,
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

    // Store order items with product details
    const orderItems = items.map((item) => {
      const product = item.products || item;
      return {
        order_id: order.id,
        product_id: product.id,
        quantity: item.quantity || 1,
        price: item.price || item.discounted_price || 0,
        color: item.color || null,
        size: item.size || null,
        product_name: product.name,
        product_image: product.image_url,
        product_category: product.category,
      };
    });

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("Error creating order items:", orderItemsError);
      // We don't return an error here since the order has been created
      // and the Stripe session has been initialized
    }

    // Update customer profile with the latest shipping information if they opted to save it
    if (shippingDetails.saveDetails) {
      await supabase.from("customer_profiles").upsert(
        {
          id: userId,
          phone: shippingDetails.phone,
          address: shippingDetails.address,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );
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
