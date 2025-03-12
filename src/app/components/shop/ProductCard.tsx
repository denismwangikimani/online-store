import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <span className="text-black">No image</span>
          </div>
        )}
        
        {/* Discount badge if applicable */}
        {product.discount_percentage && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
            {product.discount_percentage}% OFF
          </div>
        )}
      </div>

      <h3 className="text-base font-medium text-black">{product.name}</h3>
      
      <p className="mt-1">
        {product.discount_percentage ? (
          <>
            <span className="text-red-600 font-medium mr-2">
              ${product.discounted_price.toFixed(2)}
            </span>
            <span className="text-gray-500 text-sm line-through">
              ${product.price.toFixed(2)}
            </span>
          </>
        ) : (
          <span className="text-black font-medium">${product.price.toFixed(2)}</span>
        )}
      </p>
    </Link>
  );
}