import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface CategorySectionProps {
  category: Category;
  products: Product[];
}

export default function CategorySection({ category, products }: CategorySectionProps) {
  // If no products, don't show the section
  if (!products.length) return null;
  
  // Limit to 4 products for display
  const displayProducts = products.slice(0, 4);
  const hasMoreProducts = products.length > 4;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Image Banner - taking 3/4 of screen height */}
        {category.image_url && (
          <div className="relative w-full h-[75vh] mb-8 overflow-hidden rounded-lg">
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
        
        {/* Category Title - centered below image */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">{category.name}</h2>
        </div>
        
        {/* Products Grid - centered layout */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 justify-items-center max-w-screen-xl">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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