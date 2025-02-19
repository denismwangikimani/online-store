/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import ProductList from "@/app/components/ProductList"; // Reuse your product list component
import toast from "react-hot-toast";

export default function CategoryProducts() {
  const params = useParams();
  const categoryId = params.id; // assuming this is the category's id
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the category details
  useEffect(() => {
    async function fetchCategory() {
      try {
        const response = await fetch(`/api/categories/${categoryId}`);
        if (!response.ok) throw new Error("Failed to fetch category");
        const data = await response.json();
        setCategory(data);
      } catch (error) {
        toast.error("Error fetching category");
      }
    }
    fetchCategory();
  }, [categoryId]);

  // Once category is fetched, load its products using the category name
  useEffect(() => {
    async function fetchProducts() {
      if (category) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/api/products?category=${encodeURIComponent(category.name)}`
          );
          if (!response.ok) throw new Error("Failed to fetch products");
          const data = await response.json();
          setProducts(data);
        } catch (error) {
          toast.error("Error fetching products");
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchProducts();
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">
        {category ? category.name : "Category"} Products
      </h1>
      {isLoading ? <p>Loading...</p> : <ProductList products={products} />}
    </div>
  );
}
