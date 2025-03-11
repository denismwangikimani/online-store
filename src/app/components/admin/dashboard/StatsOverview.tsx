import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TagIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";
import { OverviewStats } from "@/types/dashboard";

interface StatsOverviewProps {
  stats: OverviewStats;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      name: "Total Products",
      value: stats.totalProducts,
      icon: ShoppingBagIcon,
      iconColor: "bg-blue-100 text-blue-600",
    },
    {
      name: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCartIcon,
      iconColor: "bg-green-100 text-green-600",
    },
    {
      name: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      iconColor: "bg-purple-100 text-purple-600",
    },
    {
      name: "Total Customers",
      value: stats.totalCustomers,
      icon: UserGroupIcon,
      iconColor: "bg-orange-100 text-orange-600",
    },
    {
      name: "Categories",
      value: stats.totalCategories,
      icon: SquaresPlusIcon,
      iconColor: "bg-indigo-100 text-indigo-600",
    },
    {
      name: "Active Discounts",
      value: stats.activeDiscounts,
      icon: TagIcon,
      iconColor: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => (
        <div
          key={stat.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className={`rounded-md p-3 ${stat.iconColor}`}>
                <stat.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
