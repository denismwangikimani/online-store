import Image from "next/image";
import Link from "next/link";
import { TopProduct } from "@/types/dashboard";

interface TopSellingProductsProps {
  products: TopProduct[];
}

export default function TopSellingProducts({
  products,
}: TopSellingProductsProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Top Selling Products
      </h3>

      {products.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No product data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0 flex items-center justify-center bg-indigo-100 h-10 w-10 rounded-full text-indigo-600 font-bold text-lg mr-4">
                {index + 1}
              </div>
              <div className="flex-shrink-0 h-16 w-16 relative mr-4">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-indigo-600 line-clamp-1"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-gray-500">
                  {product.sold} units sold
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  ${product.revenue.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
