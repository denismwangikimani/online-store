import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");

    // Get current date in ISO format
    const currentDate = new Date().toISOString().split("T")[0];

    // First get all products
    let query = supabase.from("products").select("*");
    if (category) {
      query = query.eq("category", category);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    // Get active discounts
    const { data: activeDiscounts, error: discountError } = await supabase
      .from("discounts")
      .select("*")
      .lte("start_date", currentDate)
      .gte("end_date", currentDate);

    if (discountError) throw discountError;

    // Get discount-product relationships
    const { data: discountProducts, error: dpError } = await supabase
      .from("discount_products")
      .select("*");

    if (dpError) throw dpError;

    // Add discount information to each product
    const productsWithDiscounts = products.map((product) => {
      // Find if this product has any active discount
      const productDiscountRelation = discountProducts.find(
        (dp) => dp.product_id === product.id
      );

      if (productDiscountRelation) {
        // Find the discount details
        const discount = activeDiscounts.find(
          (d) => d.id === productDiscountRelation.discount_id
        );

        if (discount) {
          // Add discount information to the product
          return {
            ...product,
            discount_percentage: discount.percentage,
            discounted_price: +(
              product.price *
              (1 - discount.percentage / 100)
            ).toFixed(2),
          };
        }
      }

      return product;
    });

    return NextResponse.json(productsWithDiscounts);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error.message || "Error fetching products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    const productData = await request.json();
    
    // Ensure colors and sizes are properly formatted as arrays
    const colors = Array.isArray(productData.colors) ? productData.colors : [];
    const sizes = Array.isArray(productData.sizes) ? productData.sizes : [];
    
    const { data, error } = await supabase
      .from("products")
      .insert({
        ...productData,
        colors,
        sizes
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error.message || "Error creating product" },
      { status: 500 }
    );
  }
}
