"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import ProductCard from "@/app/components/shop/ProductCard";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch category
        const categoryRes = await fetch(`/api/categories/${id}`);
        if (!categoryRes.ok) throw new Error("Failed to fetch category");
        const categoryData = await categoryRes.json();
        setCategory(categoryData);

        // Fetch products for this category
        const productsRes = await fetch(
          `/api/products?category=${encodeURIComponent(categoryData.name)}`
        );
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        const productsData = await productsRes.json();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        Loading...
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        Category not found
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {category.name} Collection
        </h1>
      </div>

      {/* Category Image Banner */}
      {category.image_url && (
        <div className="relative w-full h-[300px] mb-12 overflow-hidden rounded-lg">
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
