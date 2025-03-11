"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface ShippingDetails {
  name: string;
  phone: string;
  address: ShippingAddress;
  saveDetails: boolean;
  billingAddress?: BillingAddress;
}

interface ShippingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shippingDetails: ShippingDetails) => void;
  initialDetails: ShippingDetails;
  isProcessing: boolean;
}

export default function ShippingFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialDetails,
  isProcessing,
}: ShippingFormModalProps) {
  const [shippingDetails, setShippingDetails] =
    useState<ShippingDetails>(initialDetails);
  const [useSameAddress, setUseSameAddress] = useState(true);

  const handleShippingInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setShippingDetails((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else if (name.startsWith("billing.")) {
      const billingField = name.split(".")[1];
      setShippingDetails((prev) => ({
        ...prev,
        billingAddress: {
          ...(prev.billingAddress || {}),
          [billingField]: value,
        },
      }));
    } else {
      setShippingDetails((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const validateShippingDetails = () => {
    const { name, phone, address } = shippingDetails;

    if (
      !name ||
      !phone ||
      !address.line1 ||
      !address.city ||
      !address.state ||
      !address.postal_code ||
      !address.country
    ) {
      toast.error("Please complete all required shipping fields");
      return false;
    }

    if (!useSameAddress && shippingDetails.billingAddress) {
      const billing = shippingDetails.billingAddress;
      if (
        !billing.line1 ||
        !billing.city ||
        !billing.state ||
        !billing.postal_code ||
        !billing.country
      ) {
        toast.error("Please complete all required billing fields");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateShippingDetails()) return;

    const finalShippingDetails = {
      ...shippingDetails,
      billingAddress: !useSameAddress
        ? shippingDetails.billingAddress
        : undefined,
    };

    onSubmit(finalShippingDetails);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mt-3 sm:mt-0 sm:text-left">
              <h3 className="text-xl font-semibold mb-4">
                Shipping Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={shippingDetails.name}
                    onChange={handleShippingInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingDetails.phone}
                    onChange={handleShippingInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <h3 className="font-medium text-lg mb-3">Shipping Address</h3>

              <div className="space-y-3 mb-6">
                <div>
                  <label
                    htmlFor="address.line1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address Line 1*
                  </label>
                  <input
                    type="text"
                    id="address.line1"
                    name="address.line1"
                    value={shippingDetails.address.line1}
                    onChange={handleShippingInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address.line2"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="address.line2"
                    name="address.line2"
                    value={shippingDetails.address.line2}
                    onChange={handleShippingInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="address.city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City*
                    </label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={shippingDetails.address.city}
                      onChange={handleShippingInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address.state"
                      className="block text-sm font-medium text-gray-700"
                    >
                      State/Province*
                    </label>
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={shippingDetails.address.state}
                      onChange={handleShippingInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="address.postal_code"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Postal Code*
                    </label>
                    <input
                      type="text"
                      id="address.postal_code"
                      name="address.postal_code"
                      value={shippingDetails.address.postal_code}
                      onChange={handleShippingInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address.country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country*
                    </label>
                    <select
                      id="address.country"
                      name="address.country"
                      value={shippingDetails.address.country}
                      onChange={handleShippingInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="KE">Kenya</option>
                      <option value="GB">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save address checkbox */}
              <div className="flex items-center mb-6">
                <input
                  id="saveDetails"
                  name="saveDetails"
                  type="checkbox"
                  checked={shippingDetails.saveDetails}
                  onChange={handleShippingInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="saveDetails"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Save this information for next time
                </label>
              </div>

              {/* Billing address section */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <input
                    id="useSameAddress"
                    name="useSameAddress"
                    type="checkbox"
                    checked={useSameAddress}
                    onChange={() => setUseSameAddress(!useSameAddress)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="useSameAddress"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Billing address is the same as shipping address
                  </label>
                </div>

                {!useSameAddress && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-medium text-lg mb-3">
                      Billing Address
                    </h3>

                    {/* Billing address form fields */}
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor="billing.line1"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Address Line 1*
                        </label>
                        <input
                          type="text"
                          id="billing.line1"
                          name="billing.line1"
                          value={shippingDetails.billingAddress?.line1 || ""}
                          onChange={handleShippingInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Add the rest of billing fields (similar to shipping) */}
                      <div>
                        <label
                          htmlFor="billing.line2"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          id="billing.line2"
                          name="billing.line2"
                          value={shippingDetails.billingAddress?.line2 || ""}
                          onChange={handleShippingInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="billing.city"
                            className="block text-sm font-medium text-gray-700"
                          >
                            City*
                          </label>
                          <input
                            type="text"
                            id="billing.city"
                            name="billing.city"
                            value={shippingDetails.billingAddress?.city || ""}
                            onChange={handleShippingInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="billing.state"
                            className="block text-sm font-medium text-gray-700"
                          >
                            State/Province*
                          </label>
                          <input
                            type="text"
                            id="billing.state"
                            name="billing.state"
                            value={shippingDetails.billingAddress?.state || ""}
                            onChange={handleShippingInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="billing.postal_code"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Postal Code*
                          </label>
                          <input
                            type="text"
                            id="billing.postal_code"
                            name="billing.postal_code"
                            value={
                              shippingDetails.billingAddress?.postal_code || ""
                            }
                            onChange={handleShippingInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="billing.country"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Country*
                          </label>
                          <select
                            id="billing.country"
                            name="billing.country"
                            value={
                              shippingDetails.billingAddress?.country || ""
                            }
                            onChange={handleShippingInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="KE">Kenya</option>
                            <option value="GB">United Kingdom</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"
              >
                {isProcessing ? "Processing..." : "Complete Checkout"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
