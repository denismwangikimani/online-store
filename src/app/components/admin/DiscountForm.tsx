import { useState, useEffect } from "react";
import { Discount } from "@/types/discount";
import { Product } from "@/types/product";
import toast from "react-hot-toast";

interface DiscountFormProps {
  discount?: Discount;
  products: Product[];
  onSubmit: (discount: Partial<Discount>) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
}

export default function DiscountForm({
  discount,
  products,
  onSubmit,
  onCancel,
  isLoading,
}: DiscountFormProps) {
  const [formData, setFormData] = useState<Partial<Discount>>({
    percentage: 0,
    start_date: "",
    end_date: "",
    product_ids: [],
  });

  useEffect(() => {
    if (discount) {
      setFormData(discount);
    }
  }, [discount]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setFormData((prev) => ({
      ...prev,
      product_ids: selectedOptions,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error saving discount");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
    >
      <div className="px-4 py-6 sm:p-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <label
              htmlFor="percentage"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Discount Percentage
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="percentage"
                id="percentage"
                value={formData.percentage || 0}
                onChange={handleInputChange}
                required
                min={5}
                max={95}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="start_date"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Start Date
            </label>
            <div className="mt-2">
              <input
                type="date"
                name="start_date"
                id="start_date"
                value={formData.start_date || ""}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="end_date"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              End Date
            </label>
            <div className="mt-2">
              <input
                type="date"
                name="end_date"
                id="end_date"
                value={formData.end_date || ""}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="product_ids"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Select Products
            </label>
            <div className="mt-2">
              <select
                name="product_ids"
                id="product_ids"
                multiple
                value={formData.product_ids || []}
                onChange={handleProductSelect}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {isLoading
            ? "Saving..."
            : discount
            ? "Update Discount"
            : "Add Discount"}
        </button>
      </div>
    </form>
  );
}
