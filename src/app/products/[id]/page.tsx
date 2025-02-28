"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ProductCard from "@/app/components/shop/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data);
        
        // Once we have the product, fetch recommendations from other categories
        if (data && data.category) {
          fetchRecommendedProducts(data.category, data.id);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchRecommendedProducts(currentCategory: string, currentProductId: number) {
      try {
        // Fetch products from categories other than the current one
        const response = await fetch(`/api/shop/recommended-products?excludeCategory=${encodeURIComponent(currentCategory)}&excludeProduct=${currentProductId}`);
        if (!response.ok) throw new Error("Failed to fetch recommended products");
        const data = await response.json();
        setRecommendedProducts(data);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  // Set default color and size selections
  useEffect(() => {
    if (product) {
      if (product.colors?.length) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes?.length) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 bg-gray-100 aspect-square animate-pulse rounded-lg"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-6 bg-gray-100 animate-pulse rounded w-1/4"></div>
            <div className="h-32 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-12 bg-gray-100 animate-pulse rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
          Return to home
        </Link>
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

      <div className="flex flex-col md:flex-row gap-8 mb-16">
        {/* Product Image */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover object-center"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Price */}
          <div className="mt-4">
            {product.discount_percentage ? (
              <div className="flex items-center">
                <p className="text-2xl font-bold text-red-600 mr-3">
                  ${product.discounted_price.toFixed(2)}
                </p>
                <p className="text-lg text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </p>
                <span className="ml-3 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {product.discount_percentage}% OFF
                </span>
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Category */}
          <p className="text-sm text-gray-500 mt-2">
            Category: {product.category}
          </p>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Description</h2>
            <div className="mt-2 prose prose-sm text-gray-600">
              {product.description}
            </div>
          </div>

          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-900">Color</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`relative w-9 h-9 rounded-full border ${
                      selectedColor === color
                        ? "ring-2 ring-indigo-500 ring-offset-2"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  >
                    <span className="sr-only">{color}</span>
                  </button>
                ))}
              </div>
              {selectedColor && (
                <p className="mt-1 text-sm text-gray-500">
                  Selected: {selectedColor}
                </p>
              )}
            </div>
          )}

          {/* Size Options */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-900">Size</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`py-2 px-4 text-sm font-medium rounded-md ${
                      selectedSize === size
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Bag Button */}
          <button
            onClick={() => {
              // Will implement addToCart functionality later
              console.log(
                `Added to cart: ${product.name}, Color: ${selectedColor}, Size: ${selectedSize}`
              );
            }}
            className={`mt-8 w-full py-3 px-4 rounded-md font-medium ${
              (!product.colors?.length || selectedColor) &&
              (!product.sizes?.length || selectedSize)
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={
              (product.colors?.length > 0 && !selectedColor) ||
              (product.sizes?.length > 0 && !selectedSize) ||
              true // Keep disabled as per requirements until cart functionality is implemented
            }
          >
            Add to Bag
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            (Shopping cart functionality coming soon)
          </p>
        </div>
      </div>

      {/* Recommended Products Section */}
      {recommendedProducts.length > 0 && (
        <div className="mt-16 border-t border-gray-200 pt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Complete Your Look</h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-screen-xl justify-items-center">
              {recommendedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}