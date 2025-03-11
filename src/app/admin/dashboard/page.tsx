"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthProvider";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import StatsOverview from "@/app/components/admin/dashboard/StatsOverview";
import RevenueChart from "@/app/components/admin/dashboard/RevenueChart";
import OrdersTimeline from "@/app/components/admin/dashboard/OrdersTimeline";
import TopSellingProducts from "@/app/components/admin/dashboard/TopSellingProducts";
import CustomerGrowth from "@/app/components/admin/dashboard/CustomerGrowth";
import { DashboardStats } from "@/types/dashboard";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, session } = useAuth();
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">(
    "month"
  );

  useEffect(() => {
    const checkAuth = async () => {
      if (!session || !user) {
        router.push("/admin/login");
        return false;
      }
      return true;
    };

    async function fetchDashboardData() {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) return;

        setIsLoading(true);
        console.log("Fetching dashboard data...");

        const response = await fetch(`/api/dashboard?timeframe=${timeframe}`);
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            errorData = { error: errorText || "Unknown error" };
          }
          console.error("API error:", errorData);
          throw new Error(errorData.error || "Failed to fetch dashboard data");
        }

        const data = await response.json();
        console.log("Dashboard data loaded");
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, session, router, timeframe]);

  const handleTimeframeChange = (newTimeframe: "week" | "month" | "year") => {
    setTimeframe(newTimeframe);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Welcome to Your Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s an overview of your store&apos;s performance
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <span className="relative z-0 inline-flex shadow-sm rounded-md">
            <button
              type="button"
              onClick={() => handleTimeframeChange("week")}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                timeframe === "week"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => handleTimeframeChange("month")}
              className={`relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium ${
                timeframe === "month"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => handleTimeframeChange("year")}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                timeframe === "year"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Year
            </button>
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          <StatsOverview stats={stats.overview} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RevenueChart data={stats.revenueData} timeframe={timeframe} />
            <OrdersTimeline data={stats.ordersByStatus} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TopSellingProducts products={stats.topProducts} />
            <CustomerGrowth data={stats.customerGrowth} timeframe={timeframe} />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow-md rounded-lg">
          <p className="text-gray-500">No dashboard data available</p>
        </div>
      )}
    </div>
  );
}
