"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthProvider";
import { useCart } from "@/app/contexts/CartContext";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, isLoading, signOut } = useAuth();
  const { itemCount } = useCart();

  // Get user's initials for the avatar placeholder
  const getInitials = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name?.[0] || ""}${
        profile.last_name?.[0] || ""
      }`.toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                House of Kimani
              </Link>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Shopping bag icon */}
            <Link
              href="/cart"
              className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100 mr-3 relative"
            >
              <span className="sr-only">Shopping bag</span>
              <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth/Profile section */}
            {isLoading ? (
              // Loading state
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              // User is logged in - show profile menu
              <Menu as="div" className="relative ml-3">
                <Menu.Button className="flex rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <span className="sr-only">Open user menu</span>
                  {profile?.image_url ? (
                    <Image
                      className="h-8 w-8 rounded-full object-cover"
                      src={profile.image_url}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {getInitials()}
                    </div>
                  )}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/account/profile"
                          className={`${
                            active ? "bg-gray-100" : ""
                          } block px-4 py-2 text-sm text-gray-700`}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/account/orders"
                          className={`${
                            active ? "bg-gray-100" : ""
                          } block px-4 py-2 text-sm text-gray-700`}
                        >
                          Your Orders
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signOut()}
                          className={`${
                            active ? "bg-gray-100" : ""
                          } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              // User is not logged in - show sign in/up buttons
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">
                {isMobileMenuOpen ? "Close main menu" : "Open main menu"}
              </span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/cart"
              className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
            >
              <ShoppingBagIcon className="h-6 w-6 mr-2" />
              Cart
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  {profile?.image_url ? (
                    <div className="flex-shrink-0">
                      <Image
                        className="h-10 w-10 rounded-full object-cover"
                        src={profile.image_url}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        width={40}
                        height={40}
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      {getInitials()}
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {profile?.first_name} {profile?.last_name}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/account/profile"
                    className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserCircleIcon className="h-6 w-6 mr-2" />
                    Your Profile
                  </Link>
                  <Link
                    href="/account/orders"
                    className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingBagIcon className="h-6 w-6 mr-2" />
                    Your Orders
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="h-6 w-6 mr-2" />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-1 px-4">
                <Link
                  href="/auth/signin"
                  className="block py-2 text-base font-medium text-gray-700 hover:text-indigo-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="block py-2 text-base font-medium text-indigo-600 hover:text-indigo-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
