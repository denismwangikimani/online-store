"use client";
import { useState, useEffect } from "react";
import { Category } from "@/types/category";
import toast from "react-hot-toast";
import Image from "next/image";
import { uploadCategoryImage, deleteCategoryImage } from "@/services/storage";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (category: Partial<Category>) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
}

export default function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    image_url: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData(category);
    }
  }, [category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDeleteImage = async () => {
    if (formData.image_url) {
      // Only call the delete API if we have an existing URL
      try {
        await deleteCategoryImage(formData.image_url);
        setFormData((prev) => ({ ...prev, image_url: "" }));
        setPreviewUrl(null);
        setSelectedFile(null);
        toast.success("Image deleted");
      } catch (error) {
        toast.error("Failed to delete image");
        console.error(error);
      }
    } else {
      // Just clear the local state if no image has been uploaded yet
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let imageUrl = formData.image_url;

      // Upload new image if selected
      if (selectedFile) {
        imageUrl = await uploadCategoryImage(selectedFile);
        
        // Delete old image if replacing it
        if (formData.image_url && formData.image_url !== imageUrl) {
          try {
            await deleteCategoryImage(formData.image_url);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }
      }

      // Submit the form with the updated image URL
      const updatedData = { ...formData, image_url: imageUrl };
      await onSubmit(updatedData);
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error submitting category");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-sm ring-1 text-black ring-gray-900/5 sm:rounded-xl"
    >
      <div className="px-4 py-6 sm:p-8">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-900"
            >
              Category Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-900"
            >
              Category Image
            </label>
            <div className="mt-2">
              <div className="flex items-center space-x-4">
                <div className="w-32 h-32 border border-gray-300 rounded-md overflow-hidden relative">
                  {(previewUrl || formData.image_url) ? (
                    <Image
                      src={previewUrl || formData.image_url || ''}
                      alt="Category preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    Browse...
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  {(previewUrl || formData.image_url) && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-gray-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Upload a category image (optional). PNG, JPG, GIF up to 5MB.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-6 border-t border-gray-200 px-4 py-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold text-gray-900"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || isUploading}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:bg-indigo-400"
        >
          {isLoading || isUploading
            ? "Saving..."
            : category
            ? "Update Category"
            : "Add Category"}
        </button>
      </div>
    </form>
  );
}