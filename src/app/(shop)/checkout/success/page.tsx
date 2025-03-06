"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
//import { useAuth } from "@/app/contexts/AuthProvider";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
//import Image from "next/image";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/app/contexts/CartContext";

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    async function processCheckout() {
      if (!sessionId) return;

      try {
        // Verify the session and get order details
        const response = await fetch(
          `/api/shop/verify-session?session_id=${sessionId}`
        );

        if (!response.ok) {
          throw new Error("Failed to verify checkout session");
        }

        const data = await response.json();
        setOrderNumber(data.orderNumber);

        // Clear cart after successful checkout (for cart checkouts)
        if (data.checkoutType === "cart") {
          await clearCart();
        }
      } catch (error) {
        console.error("Error processing checkout:", error);
      } finally {
        setIsProcessing(false);
      }
    }

    processCheckout();
  }, [sessionId, clearCart]);

  if (isProcessing) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Processing your order...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto" />

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Thank you for your order!
        </h1>

        {orderNumber && (
          <p className="mt-2 text-lg text-gray-600">
            Your order number is{" "}
            <span className="font-medium">{orderNumber}</span>
          </p>
        )}

        <p className="mt-4 text-gray-600">
          We&apos;ve sent you an email with all the details of your purchase.
        </p>

        <div className="mt-8">
          <Link
            href="/account/orders"
            className="inline-block mr-4 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            View My Orders
          </Link>

          <Link
            href="/"
            className="inline-block px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:border-gray-400"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
