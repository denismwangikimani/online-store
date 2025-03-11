import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { TopProduct, CustomerProfile } from "@/types/dashboard";

// Keep the Order interface as it might differ from imported one
interface Order {
  id: string;
  total_amount: number;
  created_at: string;
  status: string;
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({
    cookies: () => cookieStore,
  });

  // Get timeframe from query parameters
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe") || "month";

  try {
    // Verify authentication and admin status
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profileData || !profileData.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate date filters based on timeframe
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "month":
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const startDateStr = startDate.toISOString();

    // Get total products count
    const { count: totalProducts, error: productsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (productsError) {
      throw productsError;
    }

    // Get total categories count
    const { count: totalCategories, error: categoriesError } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });

    if (categoriesError) {
      throw categoriesError;
    }

    // Get active discounts count
    const { count: activeDiscounts, error: discountsError } = await supabase
      .from("discounts")
      .select("*", { count: "exact", head: true })
      .gt("end_date", new Date().toISOString());

    if (discountsError) {
      throw discountsError;
    }

    // Get total customers count
    const { count: totalCustomers, error: customersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_admin", false);

    if (customersError) {
      throw customersError;
    }

    // Get total orders and revenue in the selected timeframe
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_amount, created_at, status")
      .gte("created_at", startDateStr)
      .order("created_at", { ascending: false });

    if (ordersError) {
      throw ordersError;
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_amount,
      0
    );

    // Get orders by status
    const ordersByStatus = orders.reduce((acc, order) => {
      const status = order.status;
      const existingStatus = acc.find((s) => s.status === status);
      if (existingStatus) {
        existingStatus.count++;
      } else {
        acc.push({ status, count: 1 });
      }
      return acc;
    }, [] as { status: string; count: number }[]);

    // Get revenue data points
    const revenueData = generateRevenueData(orders, timeframe);

    // Get top selling products
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select(
        `
        product_id,
        quantity,
        price,
        products (
          id,
          name,
          image_url
        )
      `
      )
      .in(
        "order_id",
        orders.map((o) => o.id)
      );

    if (orderItemsError) {
      throw orderItemsError;
    }

    // Process top selling products
    const productMap = new Map<number, TopProduct>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderItems.forEach((item: any) => {
      const productId = item.product_id;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          id: productId,
          name: item.products?.name || "Unknown Product",
          image_url: item.products?.image_url || null,
          sold: 0,
          revenue: 0,
        });
      }

      const productData = productMap.get(productId)!;
      productData.sold += item.quantity;
      productData.revenue += item.price * item.quantity;
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get customer growth data
    const { data: customers, error: customerGrowthError } = await supabase
      .from("profiles")
      .select("updated_at")
      .eq("is_admin", false)
      .gte("updated_at", startDateStr)
      .order("updated_at", { ascending: true });

    if (customerGrowthError) {
      throw customerGrowthError;
    }

    const customerGrowth = generateCustomerGrowthData(customers, timeframe);

    // Assemble the dashboard stats
    const dashboardStats = {
      overview: {
        totalProducts: totalProducts || 0,
        totalOrders,
        totalRevenue,
        totalCustomers: totalCustomers || 0,
        totalCategories: totalCategories || 0,
        activeDiscounts: activeDiscounts || 0,
      },
      revenueData,
      topProducts,
      ordersByStatus,
      customerGrowth,
    };

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error("Error in dashboard endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate revenue data points with fixed types
function generateRevenueData(
  orders: Order[],
  timeframe: string
): { date: string; amount: number }[] {
  // Use a standard string instead of a union type
  let formatToUse: string;
  let dateFormat: Intl.DateTimeFormatOptions;

  switch (timeframe) {
    case "week":
      formatToUse = "day";
      dateFormat = { month: "2-digit", day: "2-digit" };
      break;
    case "year":
      formatToUse = "month";
      dateFormat = { year: "numeric", month: "short" };
      break;
    case "month":
    default:
      formatToUse = "day";
      dateFormat = { month: "2-digit", day: "2-digit" };
      break;
  }

  // Group orders by date format
  const groupedData = new Map<string, number>();

  orders.forEach((order) => {
    const date = new Date(order.created_at);
    let key: string;

    if (formatToUse === "day") {
      key = date.toLocaleString("en-US", dateFormat);
    } else if (formatToUse === "week") {
      // Get the week number
      const startDate = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor(
        (date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      const weekNumber = Math.ceil(days / 7);
      key = `Week ${weekNumber}`;
    } else {
      key = date.toLocaleString("en-US", dateFormat);
    }

    groupedData.set(key, (groupedData.get(key) || 0) + order.total_amount);
  });

  // Rest of the function remains unchanged
  return Array.from(groupedData.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => {
      return a.date.localeCompare(b.date);
    });
}

// Helper function to generate customer growth data with fixed types
function generateCustomerGrowthData(
  customers: CustomerProfile[],
  timeframe: string
): { date: string; count: number }[] {
  if (customers.length === 0) {
    return [];
  }

  // Use enums for clearer format types
  //type DateFormatType = "day" | "week" | "month";

  // Use a standard string instead of a union type for the format variable
  let formatToUse: string;
  let dateFormat: Intl.DateTimeFormatOptions;

  switch (timeframe) {
    case "week":
      formatToUse = "day";
      dateFormat = { month: "2-digit", day: "2-digit" };
      break;
    case "year":
      formatToUse = "month";
      dateFormat = { year: "numeric", month: "short" };
      break;
    case "month":
    default:
      formatToUse = "day";
      dateFormat = { month: "2-digit", day: "2-digit" };
      break;
  }

  // Group customers by date format
  const groupedData = new Map<string, number>();

  customers.forEach((customer) => {
    const date = new Date(customer.updated_at);
    let key: string;

    // Use string comparison instead of type comparison
    if (formatToUse === "day") {
      key = date.toLocaleString("en-US", dateFormat);
    } else if (formatToUse === "week") {
      const startDate = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor(
        (date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      const weekNumber = Math.ceil(days / 7);
      key = `Week ${weekNumber}`;
    } else {
      key = date.toLocaleString("en-US", dateFormat);
    }

    groupedData.set(key, (groupedData.get(key) || 0) + 1);
  });

  // Rest of the function remains the same
  let cumulativeCount = 0;
  const result = Array.from(groupedData.entries())
    .map(([date, count]) => {
      cumulativeCount += count;
      return { date, count: cumulativeCount };
    })
    .sort((a, b) => {
      return a.date.localeCompare(b.date);
    });

  return result;
}
