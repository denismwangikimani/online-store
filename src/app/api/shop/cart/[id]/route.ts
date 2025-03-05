import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// PUT - Update cart item quantity
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { id } = params;

  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { quantity } = await request.json();

    // Validate quantity
    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be a positive number" },
        { status: 400 }
      );
    }

    // Get the cart item to check ownership and product information
    const { data: cartItem, error: itemError } = await supabase
      .from("cart_items")
      .select(`
        id,
        user_id,
        product_id,
        products:product_id (stock)
      `)
      .eq("id", id)
      .single();

    if (itemError || !cartItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check authorization
    if (cartItem.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check stock availability
    if (cartItem.products.stock < quantity) {
      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 400 }
      );
    }

    // Update the quantity
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: "Cart item updated" });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Error updating cart item" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { id } = params;

  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if item belongs to user before deleting
    const { data: cartItem, error: itemError } = await supabase
      .from("cart_items")
      .select("user_id")
      .eq("id", id)
      .single();

    if (itemError) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (cartItem.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the item
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { error: "Error removing item from cart" },
      { status: 500 }
    );
  }
}