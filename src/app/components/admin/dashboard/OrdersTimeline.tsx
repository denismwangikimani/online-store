import { OrdersByStatus } from "@/types/dashboard";

interface OrdersTimelineProps {
  data: OrdersByStatus[];
}

export default function OrdersTimeline({ data }: OrdersTimelineProps) {
  // Sort data to ensure a consistent order
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Define status colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Orders by Status
      </h3>

      {total === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No order data available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Donut chart visualization */}
          <div className="flex justify-center">
            <div className="relative h-60 w-60">
              {sortedData.map((item, index, array) => {
                // Calculate stroke properties
                const percentage = (item.count / total) * 100;
                const radius = 90;
                const circumference = 2 * Math.PI * radius;

                // Calculate offset for each segment
                let offset = 0;
                for (let i = 0; i < index; i++) {
                  offset += (array[i].count / total) * circumference;
                }

                // Calculate remaining circumference
                const strokeDasharray = `${
                  (percentage / 100) * circumference
                } ${circumference}`;

                return (
                  <svg
                    key={item.status}
                    className="absolute inset-0 transform -rotate-90"
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 200"
                  >
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke={getStatusColor(item.status)}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={-offset}
                    />
                  </svg>
                );
              })}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {total}
                  </div>
                  <div className="text-sm text-gray-500">Total Orders</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2">
            {sortedData.map((item) => (
              <div key={item.status} className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full ${getStatusColor(
                    item.status
                  )} mr-2`}
                ></div>
                <div className="text-sm">
                  <span className="text-gray-900 font-medium capitalize">
                    {item.status}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {item.count} ({((item.count / total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
