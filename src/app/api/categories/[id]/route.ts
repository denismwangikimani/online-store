import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteCategoryImage } from "@/services/storage";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error.message || "Error fetching category" },
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
    const category = await request.json();
    const { data, error } = await supabase
      .from("categories")
      .update(category)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error.message || "Error updating category" },
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
    // First, get the category to retrieve the image URL
    const { data: category, error: fetchError } = await supabase
      .from("categories")
      .select("image_url")
      .eq("id", params.id)
      .single();

    if (fetchError) throw fetchError;

    // Delete the category from the database
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    // If there was an image, delete it from storage
    if (category?.image_url) {
      await deleteCategoryImage(category.image_url);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error.message || "Error deleting category" },
      { status: 500 }
    );
  }
}
