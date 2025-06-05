// filepath: src/supabase/functions/send-order-notifications/emailTemplates.ts
export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: number;
  quantity: number;
  price: number;
  color?: string | null;
  size?: string | null;
  created_at?: string;
  products?: {
    id?: number;
    name?: string;
    price?: number;
    image_url?: string;
    category?: string;
  } | null;
}

export interface Order {
  id: string;
  user_id?: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_intent_id?: string;
  shipping_address?: {
    phone?: string;
    name?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  } | null;
  billing_address?: {
    name?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  updated_at?: string;
  profiles?: {
    id: string;
    email: string;
  };
  customer_profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    image_url?: string;
  } | null;
  metadata?: {
    userId?: string;
    orderNumber?: string;
    checkoutType?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  };
}

// Helper for date formatting
function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions,
): string {
  try {
    return new Intl.DateTimeFormat("en-US", options).format(
      new Date(dateString),
    );
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; // fallback
  }
}

// --- Customer Order Confirmation Email HTML ---
export function generateCustomerOrderConfirmationHtml(
  order: Order,
  items: OrderItem[],
): string {
  const customerName = order.customer_profiles?.first_name ||
    order.shipping_address?.name ||
    "Valued Customer";
  const orderDate = formatDate(order.created_at, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const createdAt = formatDate(order.created_at, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const updatedAt = order.updated_at
    ? formatDate(order.updated_at, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    : "N/A";

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.products?.name || "N/A"}
        <br>
        <small>
          Quantity: ${item.quantity}
          ${item.color ? `<br>Color: ${item.color}` : ""}
          ${item.size ? `<br>Size: ${item.size}` : ""}
        </small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${
        (
          item.price * item.quantity
        ).toFixed(2)
      }</td>
    </tr>
  `,
    )
    .join("");

  const shippingInfoHtml = order.shipping_address
    ? `
    <h2 style="color: #333;">Shipping Information</h2>
    <p style="color: #555; margin-bottom: 5px;">${order.shipping_address.name}</p>
    <p style="color: #555; margin-bottom: 5px;">${order.shipping_address.line1}</p>
    ${
      order.shipping_address.line2
        ? `<p style="color: #555; margin-bottom: 5px;">${order.shipping_address.line2}</p>`
        : ""
    }
    <p style="color: #555; margin-bottom: 5px;">${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}</p>
    <p style="color: #555; margin-bottom: 20px;">${order.shipping_address.country}</p>
  `
    : "<p>Shipping information not available or not applicable.</p>";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; padding: 20px;">
      <h1 style="color: #333; text-align: center;">Thank You for Your Order!</h1>
      <p>Hi ${customerName},</p>
      <p>Your order #${order.order_number} has been confirmed. Here are the details:</p>
      
      <h2 style="color: #333;">Order Summary</h2>
      <p style="color: #555; margin-bottom: 5px;"><strong>Order #:</strong> ${order.order_number}</p>
      <p style="color: #555; margin-bottom: 5px;"><strong>Date:</strong> ${orderDate}</p>
      <p style="color: #555; margin-bottom: 5px;"><strong>Status:</strong> ${order.status}</p>
      <p style="color: #555; margin-bottom: 20px;"><strong>Total:</strong> $${
    order.total_amount.toFixed(
      2,
    )
  }</p>

      ${shippingInfoHtml}

      <h2 style="color: #333;">Order Items</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #ddd;">Product Details</th>
            <th style="text-align: right; padding: 10px; border-bottom: 2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p style="text-align: right; font-size: 1.2em; font-weight: bold; margin-bottom: 20px;">Grand Total: $${
    order.total_amount.toFixed(
      2,
    )
  }</p>

      <h2 style="color: #333;">Order History</h2>
      <p style="color: #555; margin-bottom: 5px;"><strong>Created:</strong> ${createdAt}</p>
      <p style="color: #555; margin-bottom: 5px;"><strong>Last Updated:</strong> ${updatedAt}</p>

      <p>We'll notify you once your order has shipped. If you have any questions, feel free to contact us.</p>
      <p>Thanks,<br>The House Of Kimani Team</p>
    </div>
  `;
}

// --- Admin Order Notification Email HTML ---
export function generateAdminOrderNotificationHtml(
  order: Order,
  items: OrderItem[],
): string {
  const customerFullName =
    `${order.customer_profiles?.first_name || ""} ${
      order.customer_profiles?.last_name || ""
    }`.trim() ||
    order.shipping_address?.name ||
    "N/A";
  const customerEmail = order.customer_profiles?.email ||
    order.profiles?.email || "N/A";
  const orderDate = formatDate(order.created_at, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const createdAt = formatDate(order.created_at, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const updatedAt = order.updated_at
    ? formatDate(order.updated_at, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    : "N/A";

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.products?.name || "N/A"}
        <br>
        <small>
          Quantity: ${item.quantity}
          ${item.color ? `<br>Color: ${item.color}` : ""}
          ${item.size ? `<br>Size: ${item.size}` : ""}
        </small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${
        (
          item.price * item.quantity
        ).toFixed(2)
      }</td>
    </tr>
  `,
    )
    .join("");

  const shippingInfoHtml = order.shipping_address
    ? `
    <h3 style="color: #333;">Shipping Information</h3>
    <p style="color: #555; margin-bottom: 5px;">${order.shipping_address.name}</p>
    <p style="color: #555; margin-bottom: 5px;">${
      order.shipping_address.phone || "No phone provided"
    }</p>
    <p style="color: #555; margin-bottom: 5px;">${order.shipping_address.line1}</p>
    ${
      order.shipping_address.line2
        ? `<p style="color: #555; margin-bottom: 5px;">${order.shipping_address.line2}</p>`
        : ""
    }
    <p style="color: #555; margin-bottom: 5px;">${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}</p>
    <p style="color: #555; margin-bottom: 20px;">${order.shipping_address.country}</p>
  `
    : "<p>Shipping information not available or not applicable.</p>";

  // IMPORTANT: Replace 'YOUR_ADMIN_ORDER_DETAIL_URL_BASE' with your actual admin panel URL
  const adminOrderLink = `YOUR_ADMIN_ORDER_DETAIL_URL_BASE/${order.id}`;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; padding: 20px;">
      <h1 style="color: #d9534f; text-align: center;">New Order Notification!</h1>
      <p>A new order has been placed on House Of Kimani.</p>
      
      <h2 style="color: #333;">Order Summary</h2>
      <p style="color: #555; margin-bottom: 5px;"><strong>Order #:</strong> ${order.order_number}</p>
      <p style="color: #555; margin-bottom: 5px;"><strong>Date:</strong> ${orderDate}</p>
      <p style="color: #555; margin-bottom: 5px;"><strong>Status:</strong> ${order.status}</p>
      <p style="color: #555; margin-bottom: 20px;"><strong>Total:</strong> $${
    order.total_amount.toFixed(
      2,
    )
  }</p>

      <h2 style="color: #333;">Customer Details</h2>
      <p style="color: #555; margin-bottom: 5px;"><strong>Name:</strong> ${customerFullName}</p>
      <p style="color: #555; margin-bottom: 20px;"><strong>Email:</strong> ${customerEmail}</p>

      ${shippingInfoHtml}

      <h2 style="color: #333;">Order Items</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #ddd;">Product Details</th>
            <th style="text-align: right; padding: 10px; border-bottom: 2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p style="text-align: right; font-size: 1.2em; font-weight: bold; margin-bottom: 20px;">Grand Total: $${
    order.total_amount.toFixed(
      2,
    )
  }</p>
      
      <h2 style="color: #333;">Order History</h2>
      <p style="color: #555; margin-bottom: 5px;"><strong>Created:</strong> ${createdAt}</p>
      <p style="color: #555; margin-bottom: 5px;"><strong>Last Updated:</strong> ${updatedAt}</p>

      <p style="text-align: center; margin-top: 20px;">
        <a href="${adminOrderLink}" style="background-color: #5bc0de; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order in Admin</a>
      </p>
    </div>
  `;
}
