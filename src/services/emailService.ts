import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

// Initialize MailerSend
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
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
  customer_profiles?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  profiles?: {
    email?: string;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  product_name?: string;
  products?: {
    name?: string;
  };
}

// Email templates
export const generateCustomerOrderConfirmationEmail = (order: Order, items: OrderItem[]) => {
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; text-align: left;">
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">
          ${item.product_name || item.products?.name}
        </div>
        <div style="font-size: 14px; color: #6b7280;">
          Quantity: ${item.quantity}
          ${item.color ? `<br>Color: ${item.color}` : ''}
          ${item.size ? `<br>Size: ${item.size}` : ''}
        </div>
      </td>
      <td style="padding: 12px; text-align: right; font-weight: 600; color: #1f2937;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
            Order Confirmed! 🎉
          </h1>
          <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 16px;">
            Thank you for shopping with House Of Kimani
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          
          <!-- Order Summary -->
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #667eea;">
            <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
              Order Details
            </h2>
            <div style="display: grid; gap: 8px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280; font-weight: 500;">Order Number:</span>
                <span style="color: #1f2937; font-weight: 600;">${order.order_number}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280; font-weight: 500;">Order Date:</span>
                <span style="color: #1f2937; font-weight: 600;">${new Date(order.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280; font-weight: 500;">Status:</span>
                <span style="background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                  ${order.status}
                </span>
              </div>
            </div>
          </div>

          ${order.shipping_address ? `
          <!-- Shipping Address -->
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
              📦 Shipping Address
            </h3>
            <div style="color: #4b5563; line-height: 1.6;">
              <div style="font-weight: 600; color: #1f2937;">${order.shipping_address.name}</div>
              ${order.shipping_address.phone ? `<div>${order.shipping_address.phone}</div>` : ''}
              <div>${order.shipping_address.line1}</div>
              ${order.shipping_address.line2 ? `<div>${order.shipping_address.line2}</div>` : ''}
              <div>${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}</div>
              <div>${order.shipping_address.country}</div>
            </div>
          </div>
          ` : ''}

          <!-- Order Items -->
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
              🛍️ Order Items
            </h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 16px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                    Item Details
                  </th>
                  <th style="padding: 16px; text-align: right; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Total -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 14px; font-weight: 500; margin-bottom: 4px; opacity: 0.9;">
              Total Amount
            </div>
            <div style="font-size: 32px; font-weight: 700;">
              $${order.total_amount.toFixed(2)}
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">
            Thank you for choosing House Of Kimani! ✨
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            If you have any questions about your order, please don't hesitate to contact our support team.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
};

export const generateAdminOrderNotificationEmail = (order: Order, items: OrderItem[]) => {
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px;">
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">
          ${item.product_name || item.products?.name}
        </div>
        <div style="font-size: 14px; color: #6b7280;">
          ${item.color ? `Color: ${item.color} | ` : ''}${item.size ? `Size: ${item.size}` : ''}
        </div>
      </td>
      <td style="padding: 12px; text-align: center; font-weight: 600;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; text-align: right; font-weight: 600; color: #1f2937;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const customerName = order.shipping_address?.name || order.customer_profiles?.first_name 
    ? `${order.customer_profiles?.first_name} ${order.customer_profiles?.last_name || ''}` 
    : order.profiles?.email?.split('@')[0] || 'Unknown Customer';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Alert</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
            🚨 New Order Alert!
          </h1>
          <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 16px;">
            You have a new order to process
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          
          <!-- Order Info -->
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">
            <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
              Order Information
            </h2>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #6b7280; font-weight: 500;">Order Number:</span>
                <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-family: monospace;">
                  ${order.order_number}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280; font-weight: 500;">Customer:</span>
                <span style="color: #1f2937; font-weight: 600;">${customerName}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280; font-weight: 500;">Email:</span>
                <span style="color: #1f2937; font-weight: 600;">${order.customer_profiles?.email || order.profiles?.email || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280; font-weight: 500;">Order Date:</span>
                <span style="color: #1f2937; font-weight: 600;">${new Date(order.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #6b7280; font-weight: 500;">Total Amount:</span>
                <span style="background-color: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 18px;">
                  $${order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          ${order.shipping_address ? `
          <!-- Shipping Details -->
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
              📦 Shipping Details
            </h3>
            <div style="color: #4b5563; line-height: 1.6;">
              <div style="font-weight: 600; color: #1f2937;">${order.shipping_address.name}</div>
              ${order.shipping_address.phone ? `<div style="color: #059669;">📞 ${order.shipping_address.phone}</div>` : ''}
              <div>${order.shipping_address.line1}</div>
              ${order.shipping_address.line2 ? `<div>${order.shipping_address.line2}</div>` : ''}
              <div>${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}</div>
              <div>${order.shipping_address.country}</div>
            </div>
          </div>
          ` : ''}

          <!-- Order Items -->
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
              🛍️ Order Items
            </h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 16px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                    Product
                  </th>
                  <th style="padding: 16px; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                    Qty
                  </th>
                  <th style="padding: 16px; text-align: right; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Action Required -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 8px; padding: 24px; text-align: center; color: #ffffff; margin-bottom: 24px;">
            <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
              ⚡ Action Required
            </div>
            <div style="font-size: 16px; opacity: 0.9;">
              Please process this order in your admin dashboard
            </div>
          </div>

          <!-- Order Total -->
          <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 24px; text-align: center;">
            <div style="font-size: 14px; color: #0369a1; font-weight: 500; margin-bottom: 4px;">
              Order Total
            </div>
            <div style="font-size: 32px; font-weight: 700; color: #0c4a6e;">
              $${order.total_amount.toFixed(2)}
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            This is an automated notification from House Of Kimani order management system.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
};

// Send email function using MailerSend
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const sentFrom = new Sender(process.env.FROM_EMAIL!, process.env.FROM_NAME!);
    const recipients = [new Recipient(to, to.split('@')[0])];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(html);

    const response = await mailerSend.email.send(emailParams);
    
    console.log('Email sent successfully via MailerSend:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Error sending email via MailerSend:', error);
    return { success: false, error };
  }
};