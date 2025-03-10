import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Verify authentication and admin status
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profileData || !profileData.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the order with customer information
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        profiles:user_id (
          id,
          email
        ),
        customer_profiles:user_id (
          first_name,
          last_name,
          email,
          phone,
          image_url
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order error:", orderError);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get the order items with product details
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
        *,
        products:product_id (
          id,
          name,
          price,
          image_url,
          category
        )
      `
      )
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return NextResponse.json(
        { error: "Failed to fetch order details" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order,
      items,
    });
  } catch (error) {
    console.error("Order detail fetch error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching order details" },
      { status: 500 }
    );
  }
}

// Add PUT endpoint to update order status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Verify authentication and admin status
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profileData || !profileData.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the request body
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Update the order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Order update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the order" },
      { status: 500 }
    );
  }
}
