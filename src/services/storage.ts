import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export async function uploadProductImage(file: File) {
  const supabase = createClientComponentClient();

  try {
    // Generate a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function deleteProductImage(url: string) {
  const supabase = createClientComponentClient();

  try {
    // Extract the file path from the URL
    const path = url.split("/").slice(-2).join("/");

    const { error } = await supabase.storage
      .from("product-images")
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

//banner imag part
export async function uploadBannerImage(file: File) {
  const supabase = createClientComponentClient();

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("banner-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("banner-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading banner image:", error);
    throw error;
  }
}

export async function deleteBannerImage(url: string) {
  const supabase = createClientComponentClient();

  try {
    const path = url.split("/").slice(-2).join("/");
    const { error } = await supabase.storage
      .from("banner-images")
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting banner image:", error);
    throw error;
  }
}
