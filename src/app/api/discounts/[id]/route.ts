import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data, error } = await supabase
      .from("discounts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) throw error;

    // Fetch related products
    const { data: discountProducts, error: discountProductsError } = await supabase
      .from("discount_products")
      .select("product_id")
      .eq("discount_id", params.id);

    if (discountProductsError) throw discountProductsError;

    data.product_ids = discountProducts.map((dp) => dp.product_id);

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error.message || "Error fetching discount" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const discount = await request.json();
    const { data, error } = await supabase
      .from("discounts")
      .update(discount)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    // Update discount_products table
    await supabase
      .from("discount_products")
      .delete()
      .eq("discount_id", params.id);

    const discountProducts = discount.product_ids.map((productId: number) => ({
      discount_id: params.id,
      product_id: productId,
    }));

    const { error: discountProductsError } = await supabase
      .from("discount_products")
      .insert(discountProducts);

    if (discountProductsError) throw discountProductsError;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error.message || "Error updating discount" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { error } = await supabase
      .from("discounts")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error.message || "Error deleting discount" },
      { status: 500 }
    );
  }
}