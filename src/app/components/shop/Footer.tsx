"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-50 border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 - Brand and Copyright */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              House of Kimani
            </h3>
            <p className="text-sm text-gray-600">
              &copy; {currentYear} House of Kimani. All rights reserved.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Quick Links
            </h3>
            <div className="space-y-2">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 block"
              >
                Home
              </Link>
              <Link
                href="/cart"
                className="text-sm text-gray-600 hover:text-gray-900 block"
              >
                Cart
              </Link>
              <Link
                href="/account/profile"
                className="text-sm text-gray-600 hover:text-gray-900 block"
              >
                Account
              </Link>
            </div>
          </div>

          {/* Column 3 - Admin & Contact */}
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Contact & Admin
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Admin:{" "}
                <Link
                  href="/admin/login"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Login
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Email: contact@houseofkimani.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
