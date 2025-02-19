"use client";
import { useState, useEffect } from "react";
import CategoryList from "@/app/components/admin/CategoryList";
import { Category } from "@/types/category";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error("Error fetching categories");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Error deleting category");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => router.push("/admin/categories/add")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          Add New Category
        </button>
      </div>
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <CategoryList
          categories={categories}
          onEdit={(category) =>
            router.push(`/admin/categories/edit/${category.id}`)
          }
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
