"use client";

import Link from "next/link";
import { XCircleIcon } from "@heroicons/react/24/outline";

export default function CheckoutCancel() {
  return (
    <div className="mx-auto py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="text-center">
        <XCircleIcon className="h-24 w-24 text-red-500 mx-auto" />

        <h1 className="mt-4 text-3xl font-bold text-black">
          Checkout Cancelled
        </h1>

        <p className="mt-4 text-black">
          Your checkout process was cancelled. No charges were made.
        </p>

        <div className="mt-8">
          <Link
            href="/cart"
            className="inline-block mr-4 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-900"
          >
            Return to Cart
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
