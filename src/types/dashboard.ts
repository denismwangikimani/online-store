export interface OverviewStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalCategories: number;
  activeDiscounts: number;
}

export interface RevenueDataPoint {
  date: string;
  amount: number;
}

export interface TopProduct {
  id: number;
  name: string;
  image_url: string | null;
  sold: number;
  revenue: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface CustomerGrowthPoint {
  date: string;
  count: number;
}

export interface DashboardStats {
  overview: OverviewStats;
  revenueData: RevenueDataPoint[];
  topProducts: TopProduct[];
  ordersByStatus: OrdersByStatus[];
  customerGrowth: CustomerGrowthPoint[];
}

// Updated type for order item
export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  products?: {
    id: number;
    name: string;
    image_url: string | null;
  };
}

// Updated type for customer
export interface CustomerProfile {
  updated_at: string;
}

// Updated type for order
export interface Order {
  id: string;
  total_amount: number;
  created_at: string;
  status: string;
}