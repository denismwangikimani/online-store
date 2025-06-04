import twilio from "twilio";

// Initialize Twilio client with your credentials
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  shipping_address?: {
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export const sendOrderNotificationSMS = async (order: Order) => {
  try {
    const customerName = order.shipping_address?.name || "Unknown Customer";
    const message = `🛍️ NEW ORDER ALERT!

Order: ${order.order_number}
Customer: ${customerName}
Total: $${order.total_amount.toFixed(2)}

Check your admin dashboard for details.

- House Of Kimani`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!, // +18154863344
      to: process.env.ADMIN_PHONE_NUMBER!, // +2540714989189
    });

    console.log("SMS sent successfully:", result.sid);
    return { success: true, messageSid: result.sid };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return { success: false, error };
  }
};

// Optional: Send customer order confirmation SMS
export const sendCustomerOrderSMS = async (
  order: Order,
  customerPhone: string
) => {
  try {
    const message = `Hi ${order.shipping_address?.name || "Valued Customer"}!

Your order ${order.order_number} has been confirmed! 🎉

Total: $${order.total_amount.toFixed(2)}

You'll receive an email confirmation shortly.

Thank you for shopping with House Of Kimani! ✨`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: customerPhone,
    });

    console.log("Customer SMS sent successfully:", result.sid);
    return { success: true, messageSid: result.sid };
  } catch (error) {
    console.error("Error sending customer SMS:", error);
    return { success: false, error };
  }
};
