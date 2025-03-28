import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    // Create the Supabase client properly
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", session.user.id)
      .single();

    if (orderError || !order) {
      console.error("Order error:", orderError);
      return NextResponse.json(
        { error: "Order not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get the order items
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