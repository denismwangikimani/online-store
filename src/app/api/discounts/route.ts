/* eslint-disable @typescript-eslint/no-unused-vars */
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: discounts, error } = await supabase
      .from("discounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(discounts);
  } catch (error) {
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
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating discount" },
      { status: 500 }
    );
  }
}
