import { Category } from "@/types/category";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

export default function CategoryList({
  categories,
  onEdit,
  onDelete,
}: CategoryListProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Image
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-12 w-12 relative">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover rounded-md"
                      unoptimized
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 flex items-center justify-center rounded-md">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => router.push(`/admin/categories/${category.id}/products`)}
                  className="text-green-600 hover:text-green-900 mr-4"
                >
                  View Products
                </button>
                <button
                  onClick={() => onEdit(category)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(category.id)}
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