"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryForm from "@/app/components/admin/CategoryForm";
import { Category } from "@/types/category";
import toast from "react-hot-toast";

export default function AddCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (categoryData: Partial<Category>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error("Failed to create category");
      toast.success("Category added successfully");
      router.push("/admin/categories");
    } catch (error) {
      toast.error("Error creating category");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
      </div>
      <CategoryForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/categories")}
        isLoading={isLoading}
      />
    </div>
  );
}
