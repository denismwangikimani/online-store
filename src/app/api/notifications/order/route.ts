/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {
  sendEmail,
  generateCustomerOrderConfirmationEmail,
  generateAdminOrderNotificationEmail,
} from "@/services/emailService";
import {
  sendOrderNotificationSMS,
  sendCustomerOrderSMS,
} from "@/services/phoneService";

interface NotificationResults {
  customerEmail: any;
  customerSMS: any;
  adminEmail: any;
  adminSMS: any;
  errors: string[];
}

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Fetch order details with all related data
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        profiles:user_id(email),
        customer_profiles:user_id(*)
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
        *,
        products(*)
      `
      )
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return NextResponse.json(
        { error: "Error fetching order items" },
        { status: 500 }
      );
    }

    const results: NotificationResults = {
      customerEmail: null,
      customerSMS: null,
      adminEmail: null,
      adminSMS: null,
      errors: [],
    };

    // Send customer confirmation email
    const customerEmail =
      order.customer_profiles?.email || order.profiles?.email;
    if (customerEmail) {
      try {
        const customerEmailHtml = generateCustomerOrderConfirmationEmail(
          order,
          items || []
        );
        const customerEmailResult = await sendEmail(
          customerEmail,
          `Order Confirmation - ${order.order_number} | House Of Kimani`,
          customerEmailHtml
        );
        results.customerEmail = customerEmailResult;
      } catch (error) {
        console.error("Error sending customer email:", error);
        results.errors.push("Failed to send customer email");
      }
    }

    // Send customer SMS (optional - if phone number available)
    const customerPhone = order.shipping_address?.phone;
    if (customerPhone) {
      try {
        const customerSMSResult = await sendCustomerOrderSMS(
          order,
          customerPhone
        );
        results.customerSMS = customerSMSResult;
      } catch (error) {
        console.error("Error sending customer SMS:", error);
        results.errors.push("Failed to send customer SMS");
      }
    }

    // Send admin notification email
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      try {
        const adminEmailHtml = generateAdminOrderNotificationEmail(
          order,
          items || []
        );
        const adminEmailResult = await sendEmail(
          adminEmail,
          `🚨 New Order: ${order.order_number} - $${order.total_amount.toFixed(
            2
          )} | House Of Kimani`,
          adminEmailHtml
        );
        results.adminEmail = adminEmailResult;
      } catch (error) {
        console.error("Error sending admin email:", error);
        results.errors.push("Failed to send admin email");
      }
    }

    // Send admin SMS notification
    try {
      const smsResult = await sendOrderNotificationSMS(order);
      results.adminSMS = smsResult;
    } catch (error) {
      console.error("Error sending admin SMS:", error);
      results.errors.push("Failed to send admin SMS");
    }

    return NextResponse.json({
      success: true,
      results,
      message: "Notifications processed",
    });
  } catch (error) {
    console.error("Error processing notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
