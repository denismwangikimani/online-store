"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DiscountForm from "@/app/components/admin/DiscountForm";
import { Discount } from "@/types/discount";
import { Product } from "@/types/product";
import toast from "react-hot-toast";

export default function AddDiscount() {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        toast.error("Error fetching products");
        console.error(error);
      }
    }
    fetchProducts();
  }, []);

  const handleSubmit = async (discountData: Partial<Discount>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) throw new Error("Failed to create discount");

      toast.success("Discount created successfully");
      router.push("/admin/discounts");
    } catch (error) {
      toast.error("Error creating discount");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add Discount</h1>
      </div>
      <DiscountForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        products={products}
      />
    </div>
  );
}
