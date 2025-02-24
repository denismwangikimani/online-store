"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/types/product";
import ProductList from "@/app/components/admin/ProductList";
import toast from "react-hot-toast";
import { deleteProductImage } from "@/services/storage";

export default function CategoryProducts() {
  const { id } = useParams(); // the category id
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch the category details (to get its name)
  useEffect(() => {
    async function fetchCategory() {
      try {
        const response = await fetch(`/api/categories/${id}`);
        if (!response.ok) throw new Error("Failed to fetch category");
        const data = await response.json();
        setCategoryName(data.name);
      } catch (error) {
        toast.error("Error fetching category");
        console.error(error);
      }
    }
    fetchCategory();
  }, [id]);

  // Fetch products using the category name as filter
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        let url = "/api/products";
        if (categoryName) {
          url += `?category=${encodeURIComponent(categoryName)}`;
        }
        const response = await fetch(url);
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
    if (categoryName) fetchProducts();
  }, [categoryName]);

  const handleDelete = async (id: number, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setIsLoading(true);
    try {
      // Delete the image from storage first
      if (imageUrl) {
        await deleteProductImage(imageUrl);
      }

      // Then delete the product from the database
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      toast.success("Product deleted successfully");
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      toast.error("Error deleting product");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Products in {categoryName}
      </h1>
      <button
        onClick={() => router.back()}
        className="mb-4 text-indigo-600 hover:text-indigo-900"
      >
        Back
      </button>
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <ProductList
          products={products}
          onEdit={(p) => router.push(`/admin/products/edit/${p.id}`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}