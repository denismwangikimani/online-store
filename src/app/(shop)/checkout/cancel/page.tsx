"use client";

import Link from "next/link";
import { XCircleIcon } from "@heroicons/react/24/outline";

export default function CheckoutCancel() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <XCircleIcon className="h-24 w-24 text-red-500 mx-auto" />

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Checkout Cancelled
        </h1>

        <p className="mt-4 text-gray-600">
          Your checkout process was cancelled. No charges were made.
        </p>

        <div className="mt-8">
          <Link
            href="/cart"
            className="inline-block mr-4 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Return to Cart
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
