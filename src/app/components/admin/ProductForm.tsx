"use client";
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import ImageUpload from "./ImageUpload";
import { useImageUpload } from "@/hooks/useImageUpload";
import toast from "react-hot-toast";
import { XCircleIcon } from "@heroicons/react/24/outline";

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
  const { isUploading, previewUrl, handleImageSelect, uploadImage } =
    useImageUpload();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    image_url: "",
    stock: 0,
    discount_percentage: 0,
    colors: [],
    sizes: [],
  });

  // Add state for new color/size inputs
  const [newColor, setNewColor] = useState<string>("");
  const [availableSizes] = useState<string[]>([
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
  ]);

  // Add these handlers for colors and sizes
  const handleAddColor = () => {
    if (!newColor.trim()) return;

    if (!formData.colors?.includes(newColor)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...(prev.colors || []), newColor],
      }));
    }

    setNewColor("");
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors?.filter((color) => color !== colorToRemove) || [],
    }));
  };

  const handleToggleSize = (size: string) => {
    if (formData.sizes?.includes(size)) {
      setFormData((prev) => ({
        ...prev,
        sizes: prev.sizes?.filter((s) => s !== size) || [],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        sizes: [...(prev.sizes || []), size],
      }));
    }
  };

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for numeric inputs to avoid issues with leading zeros
    if (name === "price" || name === "stock") {
      // If the input is empty, set it to empty string or 0
      const numValue = value === "" ? "" : Number(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
    >
      <div className="px-4 py-6 sm:p-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
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
            <label
              htmlFor="category"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
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
            <label
              htmlFor="price"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Price
            </label>
            <div className="mt-2">
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={formData.price === 0 ? "" : formData.price}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="stock"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Stock
            </label>
            <div className="mt-2">
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                value={formData.stock === 0 ? "" : formData.stock}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="colors"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Colors Available
            </label>
            <div className="mt-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.colors?.map((color) => (
                  <div
                    key={color}
                    className="flex items-center bg-gray-100 rounded-full pl-3 pr-1 py-1"
                  >
                    <span
                      className="w-3 h-3 mr-2 rounded-full"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="text-sm">{color}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  id="colorInput"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Color name or hex code"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="ml-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="sizes"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Sizes Available
            </label>
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleToggleSize(size)}
                    className={`py-2 px-4 text-sm rounded-md ${
                      formData.sizes?.includes(size)
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="image"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Product Image
            </label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              previewUrl={previewUrl || formData.image_url}
            />
          </div>

          <div className="col-span-full">
            <label
              htmlFor="description"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
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
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm"
        >
          {isLoading || isUploading
            ? "Saving..."
            : product
            ? "Update Product"
            : "Add Product"}
        </button>
      </div>
    </form>
  );
}
