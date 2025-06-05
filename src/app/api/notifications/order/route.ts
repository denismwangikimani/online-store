// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextResponse } from "next/server";
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import {
//   sendEmail,
//   generateCustomerOrderConfirmationEmail,
//   generateAdminOrderNotificationEmail,
// } from "@/services/emailService";
// import {
//   sendOrderNotificationSMS,
//   sendCustomerOrderSMS,
// } from "@/services/phoneService";

// interface NotificationResults {
//   customerEmail: any;
//   customerSMS: any;
//   adminEmail: any;
//   adminSMS: any;
//   errors: string[];
// }

// export async function POST(request: Request) {
//   try {
//     console.log("📬 Notification endpoint called");

//     const { orderId } = await request.json();
//     console.log("🎯 Processing notifications for order ID:", orderId);

//     if (!orderId) {
//       return NextResponse.json(
//         { error: "Order ID is required" },
//         { status: 400 }
//       );
//     }

//     const cookieStore = cookies();
//     const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

//     // Fetch order details with all related data
//     console.log("🔍 Fetching order details...");
//     const { data: order, error: orderError } = await supabase
//       .from("orders")
//       .select(
//         `
//         *,
//         profiles:user_id(email),
//         customer_profiles:user_id(*)
//       `
//       )
//       .eq("id", orderId)
//       .single();

//     if (orderError || !order) {
//       console.error("❌ Error fetching order:", orderError);
//       return NextResponse.json({ error: "Order not found" }, { status: 404 });
//     }

//     console.log("✅ Order details retrieved:", {
//       order_number: order.order_number,
//       total_amount: order.total_amount,
//       customer_email: order.customer_profiles?.email || order.profiles?.email,
//     });

//     // Fetch order items
//     console.log("🔍 Fetching order items...");
//     const { data: items, error: itemsError } = await supabase
//       .from("order_items")
//       .select(
//         `
//         *,
//         products(*)
//       `
//       )
//       .eq("order_id", orderId);

//     if (itemsError) {
//       console.error("❌ Error fetching order items:", itemsError);
//       return NextResponse.json(
//         { error: "Error fetching order items" },
//         { status: 500 }
//       );
//     }

//     console.log("✅ Order items retrieved:", items?.length || 0, "items");

//     const results: NotificationResults = {
//       customerEmail: null,
//       customerSMS: null,
//       adminEmail: null,
//       adminSMS: null,
//       errors: [],
//     };

//     // Send customer confirmation email
//     const customerEmail =
//       order.customer_profiles?.email || order.profiles?.email;
//     console.log("📧 Customer email:", customerEmail);

//     if (customerEmail) {
//       try {
//         console.log("📤 Sending customer email...");
//         const customerEmailHtml = generateCustomerOrderConfirmationEmail(
//           order,
//           items || []
//         );
//         const customerEmailResult = await sendEmail(
//           customerEmail,
//           `Order Confirmation - ${order.order_number} | House Of Kimani`,
//           customerEmailHtml
//         );
//         results.customerEmail = customerEmailResult;
//         console.log("✅ Customer email sent:", customerEmailResult.success);
//       } catch (error) {
//         console.error("❌ Error sending customer email:", error);
//         results.errors.push("Failed to send customer email");
//       }
//     } else {
//       console.log("⚠️ No customer email found");
//     }

//     // Send customer SMS (handle trial account gracefully)
//     const customerPhone = order.shipping_address?.phone;
//     console.log("📱 Customer phone:", customerPhone);

//     if (customerPhone) {
//       try {
//         console.log("📤 Sending customer SMS...");
//         const customerSMSResult = await sendCustomerOrderSMS(
//           order,
//           customerPhone
//         );
//         results.customerSMS = customerSMSResult;
//         if (customerSMSResult.skipped) {
//           console.log("⚠️ Customer SMS skipped (trial account)");
//         } else {
//           console.log("✅ Customer SMS result:", customerSMSResult.success);
//         }
//       } catch (error) {
//         console.error("❌ Error sending customer SMS:", error);
//         results.errors.push("Failed to send customer SMS");
//       }
//     }

//     // Send admin notification email
//     const adminEmail = process.env.ADMIN_EMAIL;
//     console.log("📧 Admin email:", adminEmail);

//     if (adminEmail) {
//       try {
//         console.log("📤 Sending admin email...");
//         const adminEmailHtml = generateAdminOrderNotificationEmail(
//           order,
//           items || []
//         );
//         const adminEmailResult = await sendEmail(
//           adminEmail,
//           `🚨 New Order: ${order.order_number} - $${order.total_amount.toFixed(
//             2
//           )} | House Of Kimani`,
//           adminEmailHtml
//         );
//         results.adminEmail = adminEmailResult;
//         console.log("✅ Admin email sent:", adminEmailResult.success);
//       } catch (error) {
//         console.error("❌ Error sending admin email:", error);
//         results.errors.push("Failed to send admin email");
//       }
//     }

//     // Send admin SMS notification (handle trial account gracefully)
//     try {
//       console.log("📤 Sending admin SMS...");
//       const smsResult = await sendOrderNotificationSMS(order);
//       results.adminSMS = smsResult;
//       if (smsResult.skipped) {
//         console.log("⚠️ Admin SMS skipped (trial account)");
//       } else {
//         console.log("✅ Admin SMS result:", smsResult.success);
//       }
//     } catch (error) {
//       console.error("❌ Error sending admin SMS:", error);
//       results.errors.push("Failed to send admin SMS");
//     }

//     console.log("🎉 Notification processing complete");
//     console.log("📊 Final results:", {
//       customerEmailSent: results.customerEmail?.success || false,
//       adminEmailSent: results.adminEmail?.success || false,
//       errors: results.errors,
//     });

//     return NextResponse.json({
//       success: true,
//       results,
//       message: "Notifications processed",
//     });
//   } catch (error) {
//     console.error("💥 Error processing notifications:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
