"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/app/components/admin/ProductForm";
import { Product } from "@/types/product";
import toast from "react-hot-toast";
// Remove: import { use } from "react";

export default function EditProduct({ params }: { params: { id: string } }) {
  // Directly use the params value
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`, { method: "GET" });
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        toast.error("Error fetching product");
        console.error(error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (productData: Partial<Product>) => {
    setIsLoading(true);
    try {
      // Optionally, delete the old image if a new one is uploaded
      if (productData.image_url && product?.image_url && productData.image_url !== product.image_url) {
        await deleteProductImage(product.image_url);
      }
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error("Failed to update product");
      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error) {
      toast.error("Error updating product");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>
      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/products")}
        isLoading={isLoading}
      />
    </div>
  );
}
