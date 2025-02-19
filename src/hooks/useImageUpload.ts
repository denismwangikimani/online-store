import { useState, useCallback } from "react";
import { uploadProductImage, uploadBannerImage } from "@/services/storage";

export function useImageUpload(type: "product" | "banner" = "product") {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setUploadedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const uploadImage = async () => {
    if (!uploadedImage) return null;

    setIsUploading(true);
    try {
      const imageUrl =
        type === "banner"
          ? await uploadBannerImage(uploadedImage)
          : await uploadProductImage(uploadedImage);
      return imageUrl;
    } catch (error) {
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const resetImage = useCallback(() => {
    setUploadedImage(null);
    setPreviewUrl("");
  }, []);

  return {
    isUploading,
    previewUrl,
    uploadedImage,
    handleImageSelect,
    uploadImage,
    resetImage,
  };
}
