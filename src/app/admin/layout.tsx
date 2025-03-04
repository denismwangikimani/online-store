"use client";

import AdminLayoutComponent from "../components/admin/layout/AdminLayout";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  // Get current pathname using Next.js hook
  const pathname = usePathname();

  // Check if the current page is login or signup
  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/signup";

  if (isAuthPage) {
    return (
      <>
        <Toaster position="top-center" />
        {children}
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <AdminLayoutComponent>{children}</AdminLayoutComponent>
    </>
  );
}
