"use client";

//import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ShoppingBagIcon,
  SquaresPlusIcon,
  TagIcon,
  PhotoIcon,
  UsersIcon, // Import UsersIcon
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

function SidebarLink({ href, icon, children, onClick }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-indigo-600 rounded-md transition-colors"
      onClick={onClick}
    >
      <div className="w-6 h-6">{icon}</div>
      <span>{children}</span>
    </Link>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Your sign out logic here
      toast.success("Signed out successfully");
      router.push("/admin/login");
    } catch (error) {
      toast.error("Failed to sign out");
      console.error(error);
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        id="admin-sidebar"
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo/branding */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">Admin Dashboard</h1>
        </div>

        {/* Navigation links */}
        <nav className="px-4 py-6 space-y-2">
          <SidebarLink
            href="/admin/products"
            icon={<ShoppingBagIcon />}
            onClick={onClose}
          >
            Products
          </SidebarLink>

          <SidebarLink
            href="/admin/categories"
            icon={<SquaresPlusIcon />}
            onClick={onClose}
          >
            Categories
          </SidebarLink>

          <SidebarLink
            href="/admin/discounts"
            icon={<TagIcon />}
            onClick={onClose}
          >
            Discounts
          </SidebarLink>

          <SidebarLink
            href="/admin/banner"
            icon={<PhotoIcon />}
            onClick={onClose}
          >
            Banners
          </SidebarLink>
          
          {/* Add new Customers link */}
          <SidebarLink
            href="/admin/customers"
            icon={<UsersIcon />}
            onClick={onClose}
          >
            Customers
          </SidebarLink>
        </nav>

        {/* Sign out button */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}