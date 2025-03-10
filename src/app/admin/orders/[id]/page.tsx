"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthProvider";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Order, OrderItem } from "@/types/order";

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { user, session } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      if (!session || !user) {
        router.push("/admin/login");
        return false;
      }
      return true;
    };

    async function fetchOrderDetails() {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated || !id) return;

        setIsLoading(true);

        const response = await fetch(`/api/admin/order/${id}`);

        if (response.status === 401) {
          toast.error("Please login to access this page");
          router.push("/admin/login");
          return;
        }

        if (response.status === 403) {
          toast.error("You don't have permission to view this page");
          router.push("/admin");
          return;
        }

        if (response.status === 404) {
          toast.error("Order not found");
          router.push("/admin/orders");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data.order);
        setNewStatus(data.order.status);
        setItems(data.items || []);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrderDetails();
  }, [user, session, id, router]);

  const updateOrderStatus = async () => {
    if (!order || newStatus === order.status) return;

    try {
      setUpdatingStatus(true);

      const response = await fetch(`/api/admin/order/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const updatedOrder = await response.json();
      setOrder({ ...order, ...updatedOrder });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color class
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

  // Get customer name
  const getCustomerName = () => {
    if (!order) return "Unknown";

    if (order.customer_profiles?.first_name) {
      return `${order.customer_profiles.first_name} ${
        order.customer_profiles.last_name || ""
      }`;
    } else if (order.profiles?.email) {
      return order.profiles.email.split("@")[0];
    }

    return "Unknown Customer";
  };

  // Get customer email
  const getCustomerEmail = () => {
    if (!order) return "No email available";
    return (
      order.customer_profiles?.email ||
      order.profiles?.email ||
      "No email available"
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        <p className="mt-2 text-gray-600">
          This order doesn&apos;t exist or you don&apos;t have permission to
          view it.
        </p>
        <Link
          href="/admin/orders"
          className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to orders
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Order Header */}
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.order_number}
            </h1>
            <div className="mt-2 md:mt-0 flex items-center flex-wrap gap-3">
              <span className="text-sm text-gray-500">
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

        {/* Customer Information */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Customer Information
          </h2>
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 flex-shrink-0 relative">
                  {order.customer_profiles?.image_url ? (
                    <Image
                      src={order.customer_profiles.image_url}
                      alt={getCustomerName()}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {getCustomerName().charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getCustomerName()}
                  </h3>
                  <p className="text-sm text-gray-500">{getCustomerEmail()}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 mt-4 sm:mt-0">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Update Order Status
              </h3>
              <div className="flex items-center">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mr-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  disabled={updatingStatus}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={updateOrderStatus}
                  disabled={updatingStatus || newStatus === order.status}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="px-6 py-5">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Order Items
          </h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center border-b pb-4">
                <div className="relative h-24 w-24 flex-shrink-0">
                  <Image
                    src={item.products.image_url || "/placeholder-product.png"}
                    alt={item.products.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.products.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Category: {item.products.category}
                  </p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                  {item.color && (
                    <p className="text-sm text-gray-500">Color: {item.color}</p>
                  )}
                  {item.size && (
                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="px-6 py-5 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-gray-700">Subtotal</p>
              <p className="text-gray-900">${order.total_amount.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-700">Total</p>
              <p className="text-gray-900 font-bold">
                ${order.total_amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="px-6 py-5 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Shipping Information
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <address className="not-italic text-gray-700">
                {order.shipping_address.name && (
                  <p>{order.shipping_address.name}</p>
                )}
                <p>{order.shipping_address.line1}</p>
                {order.shipping_address.line2 && (
                  <p>{order.shipping_address.line2}</p>
                )}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country}</p>
              </address>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
