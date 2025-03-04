"use client";

//import { useState } from "react";
import Image from "next/image";
import { CustomerProfile } from "@/types";

interface CustomerListProps {
  customers: CustomerProfile[];
}

export default function CustomerList({ customers }: CustomerListProps) {
  return (
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
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 relative">
                    {customer.image_url ? (
                      <Image
                        src={customer.image_url}
                        alt={`${customer.first_name || ''} ${customer.last_name || ''}`}
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
                        ? `${customer.first_name} ${customer.last_name || ''}`
                        : 'Anonymous User'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {customer.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(customer.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(customer.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper function to get initials from name
function getInitials(customer: CustomerProfile): string {
  if (customer.first_name && customer.last_name) {
    return `${customer.first_name[0]}${customer.last_name[0]}`.toUpperCase();
  } else if (customer.first_name) {
    return customer.first_name[0].toUpperCase();
  } else if (customer.email) {
    return customer.email[0].toUpperCase();
  }
  return "?";
}

// Helper function to format date
function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}