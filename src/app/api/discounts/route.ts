import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // First get all discounts
    const { data: discounts, error } = await supabase
      .from("discounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Then get discount-product relationships for all discounts
    const { data: discountProducts, error: dpError } = await supabase
      .from("discount_products")
      .select("*");

    if (dpError) {
      throw dpError;
    }

    // Add product_ids to each discount
    const discountsWithProducts = discounts.map((discount) => {
      const products = discountProducts
        .filter((dp) => dp.discount_id === discount.id)
        .map((dp) => dp.product_id);

      return {
        ...discount,
        product_ids: products,
      };
    });

    console.log("Discounts with products:", discountsWithProducts);
    return NextResponse.json(discountsWithProducts);
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: "Error fetching discounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const discount = await request.json();
    const { data, error } = await supabase
      .from("discounts")
      .insert([
        {
          percentage: discount.percentage,
          start_date: discount.start_date,
          end_date: discount.end_date,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Insert into discount_products table
    const discountProducts = discount.product_ids.map((productId: number) => ({
      discount_id: data.id,
      product_id: productId,
    }));

    const { error: discountProductsError } = await supabase
      .from("discount_products")
      .insert(discountProducts);

    if (discountProductsError) throw discountProductsError;

    return NextResponse.json(data);
  } catch (error: unknown) {
    // Add type annotation here
    console.error("Error creating discount:", error); // Log the full error for debugging

    return NextResponse.json(
      { error: error.message || "Error creating discount" }, // Include the actual error message
      { status: 500 }
    );
  }
}
