import { useState, useEffect } from "react";
import { Discount } from "@/types/discount";
import { Product } from "@/types/product";

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

  // For duration selection
  const [durationOption, setDurationOption] = useState<string>("custom");

  useEffect(() => {
    if (discount) {
      setFormData({
        percentage: discount.percentage,
        start_date: discount.start_date,
        end_date: discount.end_date,
        product_ids: discount.product_ids || [],
      });
    } else {
      // Set default start date to today
      const today = new Date();
      setFormData((prev) => ({
        ...prev,
        start_date: today.toISOString().split("T")[0],
      }));
    }
  }, [discount]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "percentage") {
      // If the input is empty, set it to empty string or 0
      const numValue = value === "" ? "" : Number(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

  // Handle duration selection
  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = e.target.value;
    setDurationOption(option);

    const startDate = new Date(formData.start_date || new Date());
    const endDate = new Date(startDate);

    switch (option) {
      case "1day":
        endDate.setDate(startDate.getDate() + 1);
        break;
      case "1week":
        endDate.setDate(startDate.getDate() + 7);
        break;
      case "2weeks":
        endDate.setDate(startDate.getDate() + 14);
        break;
      case "1month":
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case "3months":
        endDate.setMonth(startDate.getMonth() + 3);
        break;
      case "6months":
        endDate.setMonth(startDate.getMonth() + 6);
        break;
      default:
        // For custom, don't change the end date
        return;
    }

    setFormData((prev) => ({
      ...prev,
      end_date: endDate.toISOString().split("T")[0],
    }));
  };

  // Update duration option when dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      setDurationOption("custom"); // Default to custom when dates change manually
    }
  }, [formData.start_date, formData.end_date]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;
    setFormData((prev) => ({
      ...prev,
      start_date: startDate,
    }));

    // If a duration option is selected, update end date accordingly
    if (durationOption !== "custom") {
      const newStartDate = new Date(startDate);
      const endDate = new Date(newStartDate);

      switch (durationOption) {
        case "1day":
          endDate.setDate(newStartDate.getDate() + 1);
          break;
        case "1week":
          endDate.setDate(newStartDate.getDate() + 7);
          break;
        case "2weeks":
          endDate.setDate(newStartDate.getDate() + 14);
          break;
        case "1month":
          endDate.setMonth(newStartDate.getMonth() + 1);
          break;
        case "3months":
          endDate.setMonth(newStartDate.getMonth() + 3);
          break;
        case "6months":
          endDate.setMonth(newStartDate.getMonth() + 6);
          break;
      }

      setFormData((prev) => ({
        ...prev,
        end_date: endDate.toISOString().split("T")[0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting discount:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-black">
      <div>
        <label
          htmlFor="percentage"
          className="block text-sm font-medium text-gray-700"
        >
          Discount Percentage (5-95%)
        </label>
        <input
          type="number"
          id="percentage"
          name="percentage"
          min={5}
          max={95}
          value={formData.percentage === 0 ? "" : formData.percentage}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="duration"
          className="block text-sm font-medium text-gray-700"
        >
          Duration
        </label>
        <select
          id="duration"
          name="duration"
          value={durationOption}
          onChange={handleDurationChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="custom">Custom</option>
          <option value="1day">1 Day</option>
          <option value="1week">1 Week</option>
          <option value="2weeks">2 Weeks</option>
          <option value="1month">1 Month</option>
          <option value="3months">3 Months</option>
          <option value="6months">6 Months</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="start_date"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date || ""}
            onChange={handleStartDateChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="end_date"
            className="block text-sm font-medium text-gray-700"
          >
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date || ""}
            onChange={handleInputChange}
            min={formData.start_date}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="product_ids"
          className="block text-sm font-medium text-gray-700"
        >
          Products (Ctrl+Click to select multiple)
        </label>
        <select
          id="product_ids"
          name="product_ids"
          multiple
          size={5}
          value={formData.product_ids?.map(String) || []}
          onChange={handleProductSelect}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isLoading
            ? "Saving..."
            : discount
            ? "Update Discount"
            : "Create Discount"}
        </button>
      </div>
    </form>
  );
}
