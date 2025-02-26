"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DiscountForm from "@/app/components/admin/DiscountForm";
import { Discount } from "@/types/discount";
import { Product } from "@/types/product";
import toast from "react-hot-toast";

export default function EditDiscount() {
  const { id } = useParams();
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch discount details
  useEffect(() => {
    async function fetchDiscount() {
      try {
        const response = await fetch(`/api/discounts/${id}`);
        if (!response.ok) throw new Error("Failed to fetch discount");
        const data = await response.json();
        setDiscount(data);
      } catch (error) {
        toast.error("Error fetching discount");
        console.error(error);
      }
    }
    fetchDiscount();
  }, [id]);

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
      const response = await fetch(`/api/discounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) throw new Error("Failed to update discount");

      toast.success("Discount updated successfully");
      router.push("/admin/discounts");
    } catch (error) {
      toast.error("Error updating discount");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Discount</h1>
      </div>
      {discount && (
        <DiscountForm
          discount={discount}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          products={products}
        />
      )}
    </div>
  );
}