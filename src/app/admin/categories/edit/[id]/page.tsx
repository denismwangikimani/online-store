"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CategoryForm from "@/app/components/admin/CategoryForm";
import { Category } from "@/types/category";
import toast from "react-hot-toast";

export default function EditCategory({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${params.id}`, {
          method: "GET",
        });
        if (!response.ok) throw new Error("Failed to fetch category");
        const data = await response.json();
        setCategory(data);
      } catch (error) {
        toast.error("Error fetching category");
        console.error(error);
      }
    };
    fetchCategory();
  }, [params.id]);

  const handleSubmit = async (categoryData: Partial<Category>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/categories/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error("Failed to update category");
      toast.success("Category updated successfully");
      router.push("/admin/categories");
    } catch (error) {
      toast.error("Error updating category");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!category) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
      </div>
      <CategoryForm
        category={category}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/categories")}
        isLoading={isLoading}
      />
    </div>
  );
}
