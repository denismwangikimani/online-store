"use client";

import { useState } from "react";
import Image from "next/image";
//import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Order } from "@/types/order";

interface OrderListProps {
  orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  // Track which rows are expanded
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const filteredOrders =
    statusFilters.length > 0
      ? orders.filter((order) => statusFilters.includes(order.status))
      : orders;

  const toggleStatusFilter = (status: string) => {
    if (statusFilters.includes(status)) {
      setStatusFilters(statusFilters.filter((s) => s !== status));
    } else {
      setStatusFilters([...statusFilters, status]);
    }
  };

  // Toggle expanded state for a specific row
  const toggleRowExpand = (orderId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Get all unique statuses from orders
  const uniqueStatuses = Array.from(
    new Set(orders.map((order) => order.status))
  );

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  // Get customer name from order
  const getCustomerName = (order: Order) => {
    if (order.customer_profiles?.first_name) {
      return `${order.customer_profiles.first_name} ${
        order.customer_profiles.last_name || ""
      }`;
    } else if (order.profiles?.email) {
      // If no profile info, use email from auth
      return order.profiles.email.split("@")[0];
    }
    return "Unknown Customer";
  };

  return (
    <div>
      {/* Status Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Filter by Status:
        </h3>
        <div className="flex flex-wrap gap-2">
          {uniqueStatuses.map((status) => (
            <button
              key={status}
              onClick={() => toggleStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                statusFilters.includes(status)
                  ? getStatusClass(status)
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {statusFilters.includes(status) && " ✓"}
            </button>
          ))}
          {statusFilters.length > 0 && (
            <button
              onClick={() => setStatusFilters([])}
              className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="w-10 px-6 py-3 text-left text-xs font-medium text-gray-500"
              ></th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order #
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Customer
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total
              </th>
              {/* <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <>
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleRowExpand(order.id)}
                      className="text-gray-500 hover:text-indigo-600"
                    >
                      {expandedRows[order.id] ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 relative">
                        {order.customer_profiles?.image_url ? (
                          <Image
                            src={order.customer_profiles.image_url}
                            alt={getCustomerName(order)}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                            {getCustomerName(order).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {getCustomerName(order)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.customer_profiles?.email ||
                            order.profiles?.email ||
                            "No email"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total_amount.toFixed(2)}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                  </td> */}
                </tr>
                
                {/* Expanded row with order details */}
                {expandedRows[order.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="border-t border-b border-gray-200 py-4">
                        {/* Order details section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Shipping information */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                              Shipping Information
                            </h3>
                            {order.shipping_address ? (
                              <div className="bg-white p-3 rounded-md shadow-sm">
                                <address className="not-italic text-sm text-gray-600">
                                  {order.shipping_address.name && <p>{order.shipping_address.name}</p>}
                                  <p>{order.shipping_address.line1}</p>
                                  {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                                  <p>
                                    {order.shipping_address.city}, {order.shipping_address.state}{" "}
                                    {order.shipping_address.postal_code}
                                  </p>
                                  <p>{order.shipping_address.country}</p>
                                </address>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No shipping information available</p>
                            )}
                          </div>
                          
                          {/* Order status section */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                              Order Details
                            </h3>
                            <div className="bg-white p-3 rounded-md shadow-sm">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Created:</span>{" "}
                                {new Date(order.created_at).toLocaleString()}
                              </p>
                              {order.updated_at && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Last Updated:</span>{" "}
                                  {new Date(order.updated_at).toLocaleString()}
                                </p>
                              )}
                              {order.payment_intent_id && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Payment ID:</span>{" "}
                                  {order.payment_intent_id}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Order items section */}
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Order Items
                          </h3>
                          <div className="bg-white rounded-md shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Details
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {order.items?.map((item) => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="flex items-center">
                                        {item.products?.image_url && (
                                          <div className="h-10 w-10 flex-shrink-0 relative mr-3">
                                            <Image
                                              src={item.products.image_url}
                                              alt={item.products.name}
                                              fill
                                              className="object-cover rounded-md"
                                            />
                                          </div>
                                        )}
                                        <span className="text-sm font-medium text-gray-900">
                                          {item.products?.name || "Unknown Product"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                      {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                                      {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                                {!order.items?.length && (
                                  <tr>
                                    <td colSpan={3} className="px-4 py-3 text-center text-sm text-gray-500">
                                      No items found in this order
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td colSpan={2} className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                    Total:
                                  </td>
                                  <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                    ${order.total_amount.toFixed(2)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}