"use client";
import { useState, useEffect } from "react";
import { Category } from "@/types/category";
import toast from "react-hot-toast";

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
  });

  useEffect(() => {
    if (category) {
      setFormData(category);
    }
  }, [category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error submitting category");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
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
          disabled={isLoading}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
        >
          {isLoading
            ? "Saving..."
            : category
            ? "Update Category"
            : "Add Category"}
        </button>
      </div>
    </form>
  );
}
