import {
  ShoppingBagIcon,
  TagIcon,
  PhotoIcon,
  SquaresPlusIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import SidebarLink from "./SidebarLink";
import toast from "react-hot-toast";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/admin/login");
    } catch (error) {
      toast.error("Failed to sign out");
      console.error(error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        id="admin-sidebar"
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo area */}
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
            href="/admin/customers"
            icon={<UsersIcon />}
            onClick={onClose}
          >
            Customers
          </SidebarLink>

          <SidebarLink
            href="/admin/banner"
            icon={<PhotoIcon />}
            onClick={onClose}
          >
            Banners
          </SidebarLink>
        </nav>

        {/* Footer with sign out */}
        <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
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
