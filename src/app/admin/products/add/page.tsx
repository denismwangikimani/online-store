"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/app/components/admin/ProductForm";
import { Product } from "@/types/product";
import toast from "react-hot-toast";

export default function AddProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (productData: Partial<Product>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error("Failed to create product");

      toast.success("Product added successfully");
      router.push("/admin/products");
    } catch (error) {
      toast.error("Error creating product");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/products")}
        isLoading={isLoading}
      />
    </div>
  );
}
