import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// This function handles GET requests to /api/orders (no ID parameter)
export async function GET() {
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

    // First fetch orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    // Fetch profiles data separately
    const userIds = orders.map((order) => order.user_id);

    // Only proceed if there are orders
    if (userIds.length > 0) {
      // Fetch auth profiles (emails)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Fetch customer profiles
      const { data: customerProfiles, error: customerProfilesError } =
        await supabase
          .from("customer_profiles")
          .select("id, first_name, last_name, email, image_url")
          .in("id", userIds);

      if (customerProfilesError) {
        console.error(
          "Error fetching customer profiles:",
          customerProfilesError
        );
      }

      // Fetch order items with products
      const { data: orderItems, error: orderItemsError } = await supabase
        .from("order_items")
        .select(
          `
          id,
          order_id,
          product_id,
          quantity,
          price,
          color,
          size,
          products (
            id,
            name,
            image_url,
            price,
            category
          )
        `
        )
        .in(
          "order_id",
          orders.map((order) => order.id)
        );

      if (orderItemsError) {
        console.error("Error fetching order items:", orderItemsError);
      }

      // Map profiles and items to orders
      const ordersWithRelations = orders.map((order) => {
        // Find related profiles
        const profile = profiles?.find((p) => p.id === order.user_id);
        const customerProfile = customerProfiles?.find(
          (cp) => cp.id === order.user_id
        );

        // Find related items
        const items =
          orderItems?.filter((item) => item.order_id === order.id) || [];

        return {
          ...order,
          profiles: profile || null,
          customer_profiles: customerProfile || null,
          items: items,
        };
      });

      return NextResponse.json(ordersWithRelations);
    }

    // If no orders, return an empty array
    return NextResponse.json([]);
  } catch (error) {
    console.error("Unexpected error in admin orders endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
