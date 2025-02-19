"use client";
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import ImageUpload from "./ImageUpload";
import { useImageUpload } from "@/hooks/useImageUpload";
import toast from "react-hot-toast";

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Partial<Product>) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
}

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps) {
  const { isUploading, previewUrl, handleImageSelect, uploadImage } = useImageUpload();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    image_url: "",
    stock: 0,
  });

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Populate form when editing an existing product
  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image_url;
      // Upload new image if selected
      const newImageUrl = await uploadImage();
      if (newImageUrl) {
        imageUrl = newImageUrl;
      }
      await onSubmit({
        ...formData,
        image_url: imageUrl,
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error uploading image");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <div className="px-4 py-6 sm:p-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
              Product Name
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-gray-300 py-1.5 shadow-sm"
              />
            </div>
          </div>

          {/* Updated Category Dropdown */}
          <div className="sm:col-span-3">
            <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
              Category
            </label>
            <div className="mt-2">
              <select
                name="category"
                id="category"
                value={formData.category || ""}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-gray-300 py-1.5 shadow-sm"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
              Price
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="price"
                id="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="block w-full rounded-md border-gray-300 py-1.5 shadow-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="stock" className="block text-sm font-medium leading-6 text-gray-900">
              Stock
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="stock"
                id="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min="0"
                className="block w-full rounded-md border-gray-300 py-1.5 shadow-sm"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label htmlFor="image" className="block text-sm font-medium leading-6 text-gray-900">
              Product Image
            </label>
            <ImageUpload onImageSelect={handleImageSelect} previewUrl={previewUrl || formData.image_url} />
          </div>

          <div className="col-span-full">
            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
              Description
            </label>
            <div className="mt-2">
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-gray-300 py-1.5 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-6 border-t border-gray-200 px-4 py-4 sm:px-8">
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm font-semibold text-gray-900">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || isUploading}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm"
        >
          {isLoading || isUploading ? "Saving..." : product ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
