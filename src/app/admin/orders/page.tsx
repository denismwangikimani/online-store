"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthProvider";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import OrderList from "@/app/components/admin/OrdersList";
import toast from "react-hot-toast";
import { Order } from "@/types/order";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!session || !user) {
        router.push("/admin/login");
        return false;
      }
      return true;
    };

    async function fetchOrders() {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) return;
    
        setIsLoading(true);
        console.log("Fetching orders data...");
    
        const response = await fetch("/api/orders", {
          // Add cache: 'no-store' to prevent caching issues
          cache: 'no-store'
        });
        
        console.log("API response status:", response.status);
    
        if (!response.ok) {
          if (response.status === 401) {
            console.log("Unauthorized access - not authenticated");
            toast.error("Please login to access this page");
            router.push("/admin/login");
            return;
          }
          if (response.status === 403) {
            console.log("Forbidden access - not an admin");
            toast.error("You don't have permission to view this page");
            router.push("/admin");
            return;
          }
    
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (errorText) {
            errorData = { error: errorText || "Unknown error" };
          }
          console.error("API error:", errorData);
          throw new Error(errorData.error || "Failed to fetch orders");
        }
    
        const data = await response.json();
        console.log(`Loaded ${data.length} orders`);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [user, session, router]);

  // Filter orders based on search query (order number, customer name, email)
  const filteredOrders = searchQuery
    ? orders.filter((order) => {
        const customerName = order.customer_profiles
          ? `${order.customer_profiles.first_name || ""} ${
              order.customer_profiles.last_name || ""
            }`.toLowerCase()
          : "";
        const customerEmail = (
          order.customer_profiles?.email ||
          order.profiles?.email ||
          ""
        ).toLowerCase();
        const orderNumber = order.order_number.toLowerCase();

        const searchLower = searchQuery.toLowerCase();

        return (
          orderNumber.includes(searchLower) ||
          customerName.includes(searchLower) ||
          customerEmail.includes(searchLower)
        );
      })
    : orders;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <OrderList orders={filteredOrders} />
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow-md rounded-lg">
          <p className="text-gray-500">
            {searchQuery ? "No orders match your search" : "No orders found"}
          </p>
        </div>
      )}
    </div>
  );
}
