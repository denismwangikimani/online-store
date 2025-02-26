import { Discount } from "@/types/discount";
import { Product } from "@/types/product";

interface DiscountListProps {
  discounts: Discount[];
  products: Product[];
  onEdit: (discount: Discount) => void;
  onDelete: (id: number) => void;
}

export default function DiscountList({
  discounts,
  products,
  onEdit,
  onDelete,
}: DiscountListProps) {
  // Log for debugging
  console.log("Discounts data:", discounts);
  console.log("Products data:", products);

  const getProductNames = (productIds: number[] | null) => {
    // Add null check and better logging
    if (!productIds || productIds.length === 0) {
      console.log("No product IDs found for discount");
      return "No products";
    }

    console.log("Product IDs:", productIds);

    const names = productIds
      .map((id) => {
        const product = products.find((p) => p.id === id);
        if (!product) console.log(`Product with ID ${id} not found`);
        return product?.name;
      })
      .filter(Boolean)
      .join(", ");

    return names || "No products";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Discount Percentage
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Start Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              End Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Products
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {discounts.map((discount) => (
            <tr key={discount.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {discount.percentage}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(discount.start_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(discount.end_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getProductNames(discount.product_ids)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(discount)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(discount.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
