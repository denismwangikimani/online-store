"use client";

import Link from "next/link";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function SidebarLink({
  href,
  icon,
  children,
  onClick,
}: SidebarLinkProps) {
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
