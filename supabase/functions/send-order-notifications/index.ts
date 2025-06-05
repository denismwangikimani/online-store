// supabase/functions/send-order-notifications/index.ts
// If running in Deno, ensure your editor supports Deno and Deno types are enabled.
// If running in Node.js, replace with a Node.js HTTP server, e.g.:
// import { createServer } from "http";
// Otherwise, for Deno:
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  generateAdminOrderNotificationHtml,
  generateCustomerOrderConfirmationHtml,
} from "./emailTemplates.ts";

// Types should be defined within this file or imported with .ts extension
interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at?: string;
  shipping_address?: {
    name?: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  profiles?: {
    id: string;
    email: string;
  };
  customer_profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: number;
  quantity: number;
  price: number;
  color?: string | null;
  size?: string | null;
  created_at?: string;
  products?: {
    name?: string;
    price?: number;
    image_url?: string;
  };
}

// The sendEmailViaMailerSend function would also be here or imported

async function sendEmailViaMailerSend(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<boolean> {
  const apiKey = Deno.env.get("MAILERSEND_API_KEY");
  const fromEmail = Deno.env.get("FROM_EMAIL");
  const fromName = Deno.env.get("FROM_NAME");

  if (!apiKey || !fromEmail || !fromName) {
    console.error(
      "MailerSend environment variables (MAILERSEND_API_KEY, FROM_EMAIL, FROM_NAME) not set.",
    );
    return false;
  }

  const payload = {
    from: { email: fromEmail, name: fromName },
    to: [{ email: to }],
    subject: subject,
    html: html,
    text: text,
  };

  try {
    const response = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(
        `Email sent successfully to ${to}. Status: ${response.status}`,
      );
      return true;
    } else {
      const errorBody = await response.text();
      console.error(
        `Failed to send email to ${to}. Status: ${response.status}`,
        errorBody,
      );
      return false;
    }
  } catch (error) {
    console.error("Error sending email via MailerSend:", error);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    // Adjusted to expect payload like: { "record": { "id": "..." } } or { "type": "INSERT", "record": { "id": "..." } }
    // This aligns better with Supabase database webhooks/triggers
    const orderId = payload.record?.id;

    if (!orderId) {
      console.error("No orderId found in payload:", payload);
      return new Response(
        JSON.stringify({ error: "Missing orderId in request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("Processing orderId:", orderId);

    // Create Supabase client (ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in env)
    // For Edge Functions, you typically use the service_role key for admin-level access.
    const supabaseAdmin = createClient(
      Deno.env.get("DB_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    // 1. Fetch complete order details
    // Adjust the select query based on your actual table structure and needs
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        shipping_address, 
        customer_profiles:user_id (email, first_name, last_name)
      `,
      )
      .eq("id", orderId)
      .single();

    if (orderError || !orderData) {
      console.error(
        "Error fetching order:",
        orderError?.message || "Order not found",
      );
      return new Response(
        JSON.stringify({
          error: `Order not found or error fetching: ${orderError?.message}`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const order = orderData as Order;

    // 2. Fetch order items
    const { data: itemsData, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select(
        `
        *,
        products (name)
      `,
      )
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError.message);
      return new Response(
        JSON.stringify({
          error: `Error fetching order items: ${itemsError.message}`,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const items = (itemsData || []) as OrderItem[];

    // 3. Send Customer Email
    const customerEmail = order.customer_profiles?.email;
    if (customerEmail) {
      const customerHtml = generateCustomerOrderConfirmationHtml(order, items);
      const customerText =
        `Your order ${order.order_number} is confirmed. Total: $${
          order.total_amount.toFixed(
            2,
          )
        }. Thank you for shopping with House Of Kimani!`;
      await sendEmailViaMailerSend(
        customerEmail,
        `Your House Of Kimani Order #${order.order_number} is Confirmed!`,
        customerHtml,
        customerText,
      );
    } else {
      console.warn(`No customer email found for order ${order.id}`);
    }

    // 4. Send Admin Email
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    if (adminEmail) {
      const adminHtml = generateAdminOrderNotificationHtml(order, items);
      const adminText = `New order received: ${order.order_number}. Customer: ${
        order.customer_profiles?.first_name || ""
      } ${order.customer_profiles?.last_name || ""} (${
        customerEmail || "N/A"
      }). Total: $${order.total_amount.toFixed(2)}.`;
      await sendEmailViaMailerSend(
        adminEmail,
        `🚨 New Order Notification: #${order.order_number}`,
        adminHtml,
        adminText,
      );
    } else {
      console.warn("ADMIN_EMAIL environment variable not set.");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notifications processed" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in Edge Function:", error.message, error.stack);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          details: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      console.error("Error in Edge Function:", error);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          details: String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }
});
