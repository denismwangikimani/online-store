/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import {
  generateAdminOrderNotificationHtml,
  generateCustomerOrderConfirmationHtml,
  sendEmail,
} from "@/services/emailService";
import {
  sendCustomerOrderSMS,
  sendOrderNotificationSMS,
} from "@/services/phoneService";
import type { Order as EmailOrder, OrderItem as EmailOrderItem } from "@/services/emailService";

interface TestResults {
  customerEmail?: any;
  customerSMS?: any;
  adminEmail?: any;
  adminSMS?: any;
}

export async function POST(request: Request) {
  try {
    const { type = "all" } = await request.json();
    console.log("📭 Test notifications requested:", type);

    // Mock order data for testing
    const mockOrder: EmailOrder = {
      id: "test-order-id",
      order_number: "ORD-TEST-123456",
      total_amount: 99.99,
      status: "paid",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
        id: "test-profile-id",
        email: "deniskimani2022@gmail.com",
      },
      customer_profiles: {
        first_name: "Denis",
        last_name: "Kimani",
        email: "deniskimani2022@gmail.com",
      },
    };

    const mockItems: EmailOrderItem[] = [
      {
        id: "item-1",
        order_id: "test-order-id",
        product_id: 1,
        quantity: 2,
        price: 29.99,
        color: "Blue",
        size: "M",
        created_at: new Date().toISOString(),
        products: {
          id: 1,
          name: "Premium Cotton T-Shirt",
          price: 29.99,
          image_url: "https://example.com/tshirt.jpg",
          category: "Apparel",
        },
      },
      {
        id: "item-2",
        order_id: "test-order-id",
        product_id: 2,
        quantity: 1,
        price: 39.99,
        color: "Dark Blue",
        size: "L",
        created_at: new Date().toISOString(),
        products: {
          id: 2,
          name: "Designer Jeans",
          price: 39.99,
          image_url: "https://example.com/jeans.jpg",
          category: "Apparel",
        },
      },
    ];

    const results: TestResults = {};
    console.log("✅ Mock data prepared for testing");

    if (type === "customer-email" || type === "all") {
      console.log("📧 Testing customer email...");
      const html = generateCustomerOrderConfirmationHtml(mockOrder, mockItems);
      results.customerEmail = await sendEmail(
        "deniskimani2022@gmail.com",
        "Test Order Confirmation | House Of Kimani",
        html,
      );
      console.log(
        "📧 Customer email test result:",
        results.customerEmail.success,
      );
    }

    if (type === "customer-sms" || type === "all") {
      console.log("📱 Testing customer SMS...");
      results.customerSMS = await sendCustomerOrderSMS(
        mockOrder as any,
        "+2540714989189",
      );
      console.log(
        "📱 Customer SMS test result:",
        results.customerSMS.skipped
          ? "Skipped (trial account)"
          : results.customerSMS.success,
      );
    }

    if (type === "admin-email" || type === "all") {
      console.log("📧 Testing admin email...");
      const html = generateAdminOrderNotificationHtml(mockOrder, mockItems);
      results.adminEmail = await sendEmail(
        process.env.ADMIN_EMAIL || "deniskimani2022@gmail.com",
        "🚨 Test New Order Notification | House Of Kimani",
        html,
      );
      console.log("📧 Admin email test result:", results.adminEmail.success);
    }

    if (type === "admin-sms" || type === "all") {
      console.log("📱 Testing admin SMS...");
      results.adminSMS = await sendOrderNotificationSMS(mockOrder as any);
      console.log(
        "📱 Admin SMS test result:",
        results.adminSMS.skipped
          ? "Skipped (trial account)"
          : results.adminSMS.success,
      );
    }

    console.log("✅ All requested tests completed");
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("❌ Test notification error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Test failed",
    }, { status: 500 });
  }
}