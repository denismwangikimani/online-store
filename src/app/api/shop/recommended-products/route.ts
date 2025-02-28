import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Get query parameters
  const url = new URL(request.url);
  const excludeCategory = url.searchParams.get("excludeCategory");
  const excludeProduct = url.searchParams.get("excludeProduct");

  try {
    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    // Exclude the current product's category
    if (excludeCategory) {
      query = query.neq("category", excludeCategory);
    }

    // Exclude the current product
    if (excludeProduct) {
      query = query.neq("id", excludeProduct);
    }

    // Limit to one product per category for variety
    const { data: allProducts, error } = await query;

    if (error) throw error;

    // Create a map to store one product from each category
    const categoryMap = new Map();

    // Fill the map with one product from each category
    allProducts.forEach((product) => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, product);
      }
    });

    // Get the map values (one product from each category)
    const recommendedProducts = Array.from(categoryMap.values());

    // Calculate discounted prices
    recommendedProducts.forEach((product) => {
      if (product.discount_percentage) {
        product.discounted_price = Number(
          (product.price * (1 - product.discount_percentage / 100)).toFixed(2)
        );
      }
    });

    return NextResponse.json(recommendedProducts);
  } catch (error: unknown) {
    console.error("Error fetching recommended products:", error);
    return NextResponse.json(
      { error: "Error fetching recommended products" },
      { status: 500 }
    );
  }
}
