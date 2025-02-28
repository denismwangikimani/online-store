"use client";

import { useState, useEffect } from "react";
import HomeBanner from "./components/shop/HomeBanner";
import ProductCard from "./components/shop/ProductCard";
import CategorySection from "./components/shop/CategorySection";
import { Product } from "@/types/product";
import { Category } from "@/types/category";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch all products
        const productsRes = await fetch("/api/products");
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        const productsData = await productsRes.json();
        
        // Sort by created_at to get newest first
        const sortedProducts = [...productsData].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Set featured products (newest 4)
        setFeaturedProducts(sortedProducts.slice(0, 4));
        
        // Fetch categories
        const categoriesRes = await fetch("/api/categories");
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
        
        // Fetch products for each category
        const categoryProductsObj = {};
        for (const category of categoriesData) {
          const categoryProductsRes = await fetch(`/api/products?category=${encodeURIComponent(category.name)}`);
          if (categoryProductsRes.ok) {
            const categoryProductsData = await categoryProductsRes.json();
            categoryProductsObj[category.name] = categoryProductsData;
          }
        }
        setCategoryProducts(categoryProductsObj);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <HomeBanner />

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 h-64 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Category Sections */}
      {!isLoading &&
        categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            products={categoryProducts[category.name] || []}
          />
        ))}
    </div>
  );
}