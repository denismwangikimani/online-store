import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive
          ? "bg-indigo-50 text-indigo-700"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
}
