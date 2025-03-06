"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
//import { useRouter } from "next/navigation";
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

export default function Cart() {
  const {
    items,
    totalAmount,
    isLoading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  //const router = useRouter();
  const [processingCheckout, setProcessingCheckout] = useState(false);

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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Your Cart is Empty
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Add items to your cart to see them here.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-block bg-indigo-600 py-3 px-8 rounded-md font-medium text-white hover:bg-indigo-700"
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

  const handleCheckout = async () => {
    try {
      setProcessingCheckout(true);
      
      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          items: items,
          checkoutType: 'cart' 
        }),
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Continue Shopping
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

      {/* Cart items */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
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
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link
                        href={`/products/${item.products.id}`}
                        className="hover:text-indigo-600"
                      >
                        {item.products.name}
                      </Link>
                    </h3>
                    {/* Product options */}
                    <div className="mt-1 text-sm text-gray-500 space-y-1">
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
                          className="p-2 text-gray-600 hover:text-indigo-600"
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
                        <span className="px-3 text-gray-700">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="p-2 text-gray-600 hover:text-indigo-600"
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

      {/* Cart summary */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between mb-4">
            <span className="text-base font-medium text-gray-900">
              Subtotal
            </span>
            <span className="text-base font-medium text-gray-900">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between mb-4 text-sm text-gray-500">
            <span>Shipping and taxes calculated at checkout</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between">
            <button
              type="button"
              className="mb-2 sm:mb-0 sm:mr-2 px-5 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
              onClick={() => clearCart()}
            >
              Clear Cart
            </button>

            <button
              type="button"
              className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
              onClick={handleCheckout}
              disabled={processingCheckout}
            >
              {processingCheckout ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                "Checkout"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}