"use client";
import { useState, useEffect } from "react";
import { Discount } from "@/types/discount";
import { Product } from "@/types/product";
import DiscountList from "@/app/components/admin/DiscountList";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch("/api/discounts");
      if (!response.ok) throw new Error("Failed to fetch discounts");
      const data = await response.json();
      setDiscounts(data);
    } catch (error) {
      toast.error("Error fetching discounts");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error("Error fetching products");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this discount?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete discount");
      toast.success("Discount deleted successfully");
      fetchDiscounts();
    } catch (error) {
      toast.error("Error deleting discount");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Discounts</h1>
        <button
          onClick={() => router.push("/admin/discounts/add")}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add New Discount
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <DiscountList
          discounts={discounts}
          products={products}
          onEdit={(discount) =>
            router.push(`/admin/discounts/edit/${discount.id}`)
          }
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
