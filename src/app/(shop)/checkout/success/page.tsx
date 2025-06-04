"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/app/contexts/CartContext";

// Create a client component that uses useSearchParams
function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    let isMounted = true; // Track component mount status
    let hasExecuted = false; // Track if processing has been attempted

    async function processCheckout() {
      // Prevent multiple executions
      if (!sessionId || hasExecuted || !isMounted) {
        if (!sessionId) {
          setError("No session ID found");
        }
        setIsProcessing(false);
        return;
      }

      hasExecuted = true; // Mark as executed immediately

      console.log("🚀 Processing checkout for session:", sessionId);

      try {
        // Clear the cart first
        await clearCart();
        console.log("🛒 Cart cleared");

        // Fetch the order details from the session ID
        console.log("📞 Calling confirm endpoint...");
        const response = await fetch(
          `/api/shop/checkout/confirm?session_id=${sessionId}`,
          {
            method: "GET",
            cache: "no-store", // Prevent caching
          }
        );

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          console.error("❌ Confirm response error:", errorData);
          throw new Error(errorData.error || "Failed to confirm order");
        }

        const data = await response.json();
        console.log("✅ Confirm response data:", data);

        if (isMounted) {
          setOrderNumber(data.orderNumber || "unknown");
        }
      } catch (error) {
        console.error("💥 Error confirming order:", error);
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : "Failed to confirm order"
          );
        }
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    }

    // Only run if we have a session ID
    if (sessionId) {
      processCheckout();
    } else {
      setIsProcessing(false);
      setError("No session ID found");
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [sessionId, clearCart]); // Dependencies remain the same

  if (isProcessing) {
    return (
      <div className="mx-auto py-16 px-4 sm:px-6 bg-white lg:px-8 min-h-screen flex flex-col items-center">
        <LoadingSpinner />
        <p className="mt-4 text-black">Processing your order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto py-16 px-4 sm:px-6 bg-white lg:px-8 min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-black">
            Order Processing Error
          </h1>
          <p className="mt-4 text-lg text-gray-700">{error}</p>
          <div className="mt-10">
            <Link
              href="/cart"
              className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 mr-4"
            >
              Back to Cart
            </Link>
            <Link
              href="/"
              className="inline-block bg-white border border-black text-black px-6 py-3 rounded-md font-medium hover:bg-gray-100"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-16 px-4 sm:px-6 bg-white lg:px-8 min-h-screen">
      <div className="text-center">
        <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-black">
          Order Confirmed!
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          {orderNumber
            ? `Your order #${orderNumber} has been confirmed.`
            : "Your order has been confirmed."}
        </p>
        <p className="mt-2 text-gray-700">
          Thank you for your purchase! You will receive an email confirmation
          shortly.
        </p>
        <div className="mt-10">
          <Link
            href="/account/orders"
            className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 mr-4"
          >
            View Orders
          </Link>
          <Link
            href="/"
            className="inline-block bg-white border border-black text-black px-6 py-3 rounded-md font-medium hover:bg-gray-100"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main page component that wraps the client component in Suspense
export default function CheckoutSuccess() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto py-16 px-4 sm:px-6 bg-white lg:px-8 min-h-screen flex flex-col items-center">
          <LoadingSpinner />
          <p className="mt-4 text-black">Loading order details...</p>
        </div>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
