"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthProvider";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

interface CustomerProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, session } = useAuth(); // Make sure to get session too
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!session || !user) {
        console.log("No session or user, redirecting to login");
        router.push("/admin/login");
        return false;
      }
      return true;
    };

    async function fetchCustomers() {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) return;

        setIsLoading(true);
        console.log("Fetching customers data...");

        const response = await fetch("/api/customers");
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

          const errorData = await response.json();
          console.error("API error:", errorData);
          throw new Error(errorData.error || "Failed to fetch customers");
        }

        const data = await response.json();
        console.log(`Loaded ${data.length} customers`);
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to load customers");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCustomers();
  }, [user, session, router]);

  // Filter customers based on search query
  const filteredCustomers = searchQuery
    ? customers.filter(
        (customer) =>
          (customer.first_name &&
            customer.first_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (customer.last_name &&
            customer.last_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (customer.email &&
            customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : customers;

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get initials for avatar placeholder
  const getInitials = (customer: CustomerProfile) => {
    if (customer.first_name && customer.last_name) {
      return `${customer.first_name[0]}${customer.last_name[0]}`.toUpperCase();
    } else if (customer.first_name) {
      return customer.first_name[0].toUpperCase();
    } else if (customer.email) {
      return customer.email[0].toUpperCase();
    }
    return "?";
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers..."
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
      ) : filteredCustomers.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Joined
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 relative">
                          {customer.image_url ? (
                            <Image
                              src={customer.image_url}
                              alt={`${customer.first_name || ""} ${
                                customer.last_name || ""
                              }`}
                              fill
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                              {getInitials(customer)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.first_name
                              ? `${customer.first_name} ${
                                  customer.last_name || ""
                                }`
                              : "Anonymous User"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.created_at
                        ? formatDate(customer.created_at)
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.updated_at
                        ? formatDate(customer.updated_at)
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow-md rounded-lg">
          <p className="text-gray-500">
            {searchQuery
              ? "No customers match your search"
              : "No customers found"}
          </p>
        </div>
      )}
    </div>
  );
}
