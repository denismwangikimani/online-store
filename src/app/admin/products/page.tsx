"use client";
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import ProductList from "@/app/components/admin/ProductList";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { deleteProductImage } from "@/services/storage";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        toast.error("Error fetching products");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleDelete = async (id: number, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setIsLoading(true);
    try {
      // Use the imageUrl parameter to delete the product image if available
      if (imageUrl) {
        await deleteProductImage(imageUrl);
      }
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete product");
      toast.success("Product deleted successfully");
      // Re-fetch products after deletion
      const res = await fetch("/api/products");
      const updatedProducts = await res.json();
      setProducts(updatedProducts);
    } catch (error) {
      toast.error("Error deleting product");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => router.push("/admin/products/add")}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add New Product
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <ProductList
          products={products}
          onEdit={(product) =>
            router.push(`/admin/products/edit/${product.id}`)
          }
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
