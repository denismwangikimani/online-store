import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface CategorySectionProps {
  category: Category;
  products: Product[];
}

export default function CategorySection({
  category,
  products,
}: CategorySectionProps) {
  // If no products, don't show the section
  if (!products.length) return null;

  // Limit to 4 products for display
  const displayProducts = products.slice(0, 4);
  const hasMoreProducts = products.length > 4;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{category.name}</h2>
        </div>

        {/* Category Image Banner */}
        {category.image_url && (
          <div className="relative w-full h-[200px] mb-8 overflow-hidden rounded-lg">
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View Collection button if more than 4 products */}
        {hasMoreProducts && (
          <div className="text-center">
            <Link
              href={`/categories/${category.id}`}
              className="inline-block border border-indigo-600 text-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-indigo-50 transition-colors"
            >
              View Full Collection
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
