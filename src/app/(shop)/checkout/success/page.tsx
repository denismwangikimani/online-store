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
      <div className="mx-auto py-16 px-4 sm:px-6 bg-white lg:px-8 min-h-screen flex flex-col items-center">
        <LoadingSpinner />
        <p className="mt-4 text-black">Processing your order...</p>
      </div>
    );
  }

  return (
    <div className=" mx-auto py-16 px-4 sm:px-6 bg-white lg:px-8 min-h-screen">
      <div className="text-center">
        <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto" />

        <h1 className="mt-4 text-3xl font-bold text-black">
          Thank you for your order!
        </h1>

        {orderNumber && (
          <p className="mt-2 text-lg text-black">
            Your order number is{" "}
            <span className="font-medium">{orderNumber}</span>
          </p>
        )}

        <p className="mt-4 text-black">
          We&apos;ve sent you an email with all the details of your purchase.
        </p>

        <div className="mt-8">
          <Link
            href="/account/orders"
            className="inline-block mr-4 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-900"
          >
            View My Orders
          </Link>

          <Link
            href="/"
            className="inline-block px-6 py-3 border border-gray-300 rounded-md text-black hover:border-gray-400"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
