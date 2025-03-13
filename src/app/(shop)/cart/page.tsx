"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/contexts/CartContext";
import { useAuth } from "@/app/contexts/AuthProvider";
import {
  ArrowLeftIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

// Add type for shipping details// Update your ShippingAddress interface to make fields optional for billingAddress
interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// Add a separate interface for billing address with optional fields
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

export default function Cart() {
  const {
    items,
    totalAmount,
    isLoading,
    updateQuantity,
    removeItem,
    //clearCart,
  } = useCart();
  const { user } = useAuth();
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [useSameAddress, setUseSameAddress] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Shipping details state
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    name: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
    },
    saveDetails: true,
  });

  useEffect(() => {
    // Load customer profile if available
    const loadCustomerProfile = async () => {
      if (!user) return;

      setIsLoadingProfile(true);
      try {
        const response = await fetch("/api/customer/profile");
        if (response.ok) {
          const data = await response.json();
          setCustomerProfile(data);

          if (data) {
            // Pre-fill shipping details if available
            setShippingDetails((prevState) => ({
              ...prevState,
              name: data.first_name
                ? `${data.first_name} ${data.last_name || ""}`
                : "",
              phone: data.phone || "",
              address: data.address || prevState.address,
            }));
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadCustomerProfile();
  }, [user]);

  // Redirect to sign in if not authenticated
  if (!isLoading && !user) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Your Cart
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Please sign in to view your cart
          </p>
          <div className="mt-6">
            <Link
              href="/auth/signin"
              className="inline-block bg-indigo-600 py-3 px-8 rounded-md font-medium text-white hover:bg-indigo-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || isLoadingProfile) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto min-h-screen py-16 px-4 bg-white sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Your Cart is Empty
          </h1>
          <p className="mt-4 text-xl text-black">
            Add items to your cart to see them here.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-block bg-black py-3 px-8 rounded-md font-medium text-white hover:bg-gray-900"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (
    itemId: string,
    newQuantity: number,
    stock: number
  ) => {
    if (newQuantity < 1 || newQuantity > stock) return;
    await updateQuantity(itemId, newQuantity);
  };

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
          ...prev.billingAddress,
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

  const handleCheckout = async () => {
    // If shipping form isn't shown yet, show it first
    if (!showShippingForm) {
      setShowShippingForm(true);
      return;
    }

    // Validate shipping details
    if (!validateShippingDetails()) {
      return;
    }

    try {
      setProcessingCheckout(true);

      // If billing address is the same as shipping, don't send it
      const checkoutData = {
        items: items,
        checkoutType: "cart",
        shippingDetails: {
          ...shippingDetails,
          billingAddress: !useSameAddress
            ? shippingDetails.billingAddress
            : undefined,
        },
      };

      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Checkout failed");
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed. Please try again.");
      setProcessingCheckout(false);
    }
  };

  return (
    <div className="bg-white mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-black hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Continue Shopping
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-black mb-8">Your Cart</h1>

      {/* Cart items */}
      <div
        className={`bg-white shadow-md rounded-lg overflow-hidden mb-8 ${
          showShippingForm ? "opacity-50" : ""
        }`}
      >
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.id} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row">
                {/* Product image */}
                <div className="flex-shrink-0 w-full sm:w-32 h-32 mb-4 sm:mb-0 relative">
                  <Image
                    src={item.products.image_url || "/placeholder-product.png"}
                    alt={item.products.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 128px"
                    className="object-cover object-center rounded-md"
                  />
                </div>

                {/* Product info */}
                <div className="flex-1 sm:ml-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-black">
                      <Link
                        href={`/products/${item.products.id}`}
                        className="hover:text-indigo-600"
                      >
                        {item.products.name}
                      </Link>
                    </h3>
                    {/* Product options */}
                    <div className="mt-1 text-sm text-black space-y-1">
                      {item.color && <p>Color: {item.color}</p>}
                      {item.size && <p>Size: {item.size}</p>}
                    </div>
                  </div>

                  {/* Price and quantity */}
                  <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-2 sm:mb-0">
                      {item.products.discount_percentage ? (
                        <div className="flex items-center">
                          <p className="text-lg font-bold text-red-600 mr-2">
                            ${item.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500 line-through">
                            ${item.products.price.toFixed(2)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-gray-900">
                          ${item.price.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          type="button"
                          className="p-2 text-black hover:text-gray-900"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.quantity - 1,
                              item.products.stock
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="px-3 text-black">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-2 text-black hover:text-gray-900"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.quantity + 1,
                              item.products.stock
                            )
                          }
                          disabled={item.quantity >= item.products.stock}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        className="ml-4 text-red-600 hover:text-red-800"
                        onClick={() => removeItem(item.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Shipping form - show when proceeding to checkout */}
      {showShippingForm && (
        <div className="bg-white shadow-md rounded-lg text-black overflow-hidden mb-8 p-6 animate-fadeIn">
          <h2 className="text-xl font-semibold text-black mb-4">
            Shipping Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-black"
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
                className="block text-sm font-medium text-black"
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

          <h3 className="font-medium text-lg text-black mb-3">
            Shipping Address
          </h3>

          <div className="space-y-3 mb-6">
            <div>
              <label
                htmlFor="address.line1"
                className="block text-sm font-medium text-black"
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
                className="block text-sm font-medium text-black"
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
                  className="block text-sm font-medium text-black"
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
                  className="block text-sm font-medium text-black"
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

            <div className="grid grid-cols-1 text-black md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="address.postal_code"
                  className="block text-sm font-medium text-black"
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
                  className="block text-sm font-medium text-black"
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
                  {/* Add more countries as needed */}
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
              className="ml-2 block text-sm text-black"
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
                className="ml-2 block text-sm text-black"
              >
                Billing address is the same as shipping address
              </label>
            </div>

            {!useSameAddress && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-lg text-black mb-3">
                  Billing Address
                </h3>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="billing.line1"
                      className="block text-sm font-medium text-black"
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

                  <div>
                    <label
                      htmlFor="billing.line2"
                      className="block text-sm font-medium text-black"
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
                        className="block text-sm font-medium text-black"
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
                        className="block text-sm font-medium text-black"
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
                        className="block text-sm font-medium text-black"
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
                        className="block text-sm font-medium text-black"
                      >
                        Country*
                      </label>
                      <select
                        id="billing.country"
                        name="billing.country"
                        value={shippingDetails.billingAddress?.country || ""}
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

          {/* Checkout summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-black mb-4">
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <p className="text-black">Subtotal</p>
                <p className="font-medium text-black">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <p className="text-base font-medium text-black">Total</p>
                <p className="text-base font-medium text-black">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={processingCheckout}
              className="w-full mt-6 bg-black border border-transparent rounded-md py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-300"
            >
              {processingCheckout
                ? "Processing..."
                : showShippingForm
                ? "Complete Checkout"
                : "Continue to Checkout"}
            </button>
          </div>
        </div>
      )}

      {/* Cart Summary */}
      {!showShippingForm && (
        <div className="bg-white shadow-md text-black rounded-lg overflow-hidden p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-black">Subtotal</span>
              <span className="font-medium">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between">
              <span className="text-lg font-medium">Total</span>
              <span className="text-lg font-medium">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={processingCheckout}
            className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {processingCheckout ? "Processing..." : "Checkout"}
          </button>
        </div>
      )}
    </div>
  );
}
