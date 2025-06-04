/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import {
  sendEmail,
  generateCustomerOrderConfirmationEmail,
  generateAdminOrderNotificationEmail,
} from "@/services/emailService";
import {
  sendOrderNotificationSMS,
  sendCustomerOrderSMS,
} from "@/services/phoneService";

interface TestResults {
  customerEmail?: any;
  customerSMS?: any;
  adminEmail?: any;
  adminSMS?: any;
}

export async function POST(request: Request) {
  try {
    const { type = "all" } = await request.json();

    // Mock order data for testing
    const mockOrder = {
      id: "test-order-id",
      order_number: "ORD-TEST-123456",
      total_amount: 99.99,
      status: "paid",
      created_at: new Date().toISOString(),
      shipping_address: {
        name: "Denis Kimani",
        phone: "+2540714989189",
        line1: "123 Test Street",
        line2: "Apt 4B",
        city: "Nairobi",
        state: "Nairobi",
        postal_code: "00100",
        country: "KE",
      },
      profiles: {
        email: "deniskimani2022@gmail.com",
      },
    };

    const mockItems = [
      {
        id: "item-1",
        product_name: "Premium Cotton T-Shirt",
        quantity: 2,
        price: 29.99,
        color: "Blue",
        size: "M",
      },
      {
        id: "item-2",
        product_name: "Designer Jeans",
        quantity: 1,
        price: 39.99,
        color: "Dark Blue",
        size: "L",
      },
    ];

    const results: TestResults = {};

    if (type === "customer-email" || type === "all") {
      const html = generateCustomerOrderConfirmationEmail(mockOrder, mockItems);
      results.customerEmail = await sendEmail(
        "deniskimani2022@gmail.com",
        "Test Order Confirmation | House Of Kimani",
        html
      );
    }

    if (type === "customer-sms" || type === "all") {
      results.customerSMS = await sendCustomerOrderSMS(
        mockOrder,
        "+2540714989189"
      );
    }

    if (type === "admin-email" || type === "all") {
      const html = generateAdminOrderNotificationEmail(mockOrder, mockItems);
      results.adminEmail = await sendEmail(
        process.env.ADMIN_EMAIL!,
        "🚨 Test New Order Notification | House Of Kimani",
        html
      );
    }

    if (type === "admin-sms" || type === "all") {
      results.adminSMS = await sendOrderNotificationSMS(mockOrder);
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Test notification error:", error);
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}
