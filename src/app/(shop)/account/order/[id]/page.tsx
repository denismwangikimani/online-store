"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthProvider";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

type OrderItem = {
  id: string;
  product_id: number;
  quantity: number;
  price: number;
  color: string | null;
  size: string | null;
  products: {
    id: number;
    name: string;
    image_url: string;
    price: number;
    category: string;
  };
};

type Address = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: Address;
  billing_address: Address;
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!user || !id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/shop/order/${id}`);

        if (response.status === 404) {
          router.push("/account/orders");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data.order);
        setItems(data.items || []);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrderDetails();
  }, [user, id, router]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className=" mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center bg-white">
        <h1 className="text-2xl font-bold text-black">Order not found</h1>
        <p className="mt-2 text-black">
          This order doesn&apos;t exist or you don&apos;t have permission to
          view it.
        </p>
        <Link
          href="/account/orders"
          className="mt-4 inline-flex items-center text-black hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to orders
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-white text-black">
      <div className="mb-8">
        <Link
          href="/account/orders"
          className="inline-flex items-center text-sm text-black hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to orders
        </Link>
      </div>

      <div className="border-b border-gray-200 pb-5 mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h1 className="text-2xl font-bold text-black">
            Order #{order.order_number}
          </h1>
          <div className="mt-2 md:mt-0 flex items-center">
            <span className="text-sm text-black mr-3">
              Placed on {formatDate(order.created_at)}
            </span>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusClass(
                order.status
              )}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-black mb-4">Order Items</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row">
                  {/* Product image */}
                  <div className="flex-shrink-0 w-full sm:w-32 h-32 mb-4 sm:mb-0 relative">
                    <Image
                      src={
                        item.products.image_url || "/placeholder-product.png"
                      }
                      alt={item.products.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 128px"
                      className="object-cover object-center rounded-md"
                    />
                  </div>

                  {/* Product info */}
                  <div className="flex-1 sm:ml-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-black">
                        <Link
                          href={`/products/${item.products.id}`}
                          className="hover:text-indigo-600"
                        >
                          {item.products.name}
                        </Link>
                      </h3>
                      <div className="mt-1 text-sm text-black space-y-1">
                        {item.color && <p>Color: {item.color}</p>}
                        {item.size && <p>Size: {item.size}</p>}
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="mt-2 font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mt-8 bg-gray-50 px-4 py-6 sm:px-6 rounded-lg">
        <div className="flex justify-between text-base font-medium text-black mb-4">
          <p>Subtotal</p>
          <p>${order.total_amount.toFixed(2)}</p>
        </div>
        <div className="flex justify-between text-base font-medium text-black">
          <p>Total</p>
          <p>${order.total_amount.toFixed(2)}</p>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shipping_address && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-black mb-4">
            Shipping Information
          </h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <address className="not-italic">
                {order.shipping_address.name}
                <br />
                {order.shipping_address.line1}
                {order.shipping_address.line2 && (
                  <>
                    <br />
                    {order.shipping_address.line2}
                  </>
                )}
                <br />
                {order.shipping_address.city}, {order.shipping_address.state}{" "}
                {order.shipping_address.postal_code}
                <br />
                {order.shipping_address.country}
              </address>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
