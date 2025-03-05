import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// GET - Fetch user's cart items
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Join cart_items with products to get product details
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        color,
        size,
        products:product_id (
          id,
          name,
          price,
          image_url,
          discount_percentage,
          stock
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Calculate discounted prices where applicable
    const cartWithPricing = cartItems.map((item) => {
      const product = item.products;
      let price = product.price;
      let total = price * item.quantity;
      
      // Calculate discounted price if available
      if (product.discount_percentage) {
        price = Number((product.price * (1 - product.discount_percentage / 100)).toFixed(2));
        total = Number((price * item.quantity).toFixed(2));
      }
      
      return {
        ...item,
        products: {
          ...product,
          discounted_price: product.discount_percentage ? price : null
        },
        price,
        total
      };
    });

    // Calculate cart totals
    const cartTotal = cartWithPricing.reduce((sum, item) => sum + item.total, 0);
    const itemCount = cartWithPricing.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      items: cartWithPricing,
      totalAmount: Number(cartTotal.toFixed(2)),
      itemCount
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Error fetching cart" },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { productId, quantity = 1, color = null, size = null } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, stock")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const { data: existingItem, error: existingError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", session.user.id)
      .eq("product_id", productId)
      .eq("color", color)
      .eq("size", size)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }

    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity;
      
      // Check if updated quantity exceeds stock
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: "Not enough stock available" },
          { status: 400 }
        );
      }
      
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", existingItem.id);

      if (updateError) throw updateError;
      
      return NextResponse.json({ 
        message: "Cart updated successfully",
        updated: true,
        itemId: existingItem.id
      });
    } else {
      // Insert new item
      const { data: newItem, error: insertError } = await supabase
        .from("cart_items")
        .insert({
          user_id: session.user.id,
          product_id: productId,
          quantity,
          color,
          size
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      
      return NextResponse.json({ 
        message: "Item added to cart",
        added: true,
        itemId: newItem.id
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Error adding item to cart" },
      { status: 500 }
    );
  }
}