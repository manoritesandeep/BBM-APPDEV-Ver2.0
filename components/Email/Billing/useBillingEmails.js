import { useContext } from "react";
import { EmailService } from "../EmailService";
import { EmailTemplates } from "../EmailTemplates";
import { AuthContext } from "../../../store/auth-context";

/**
 * Custom hook for handling billing and order-related emails
 * Manages order confirmations, shipping notifications, and receipts
 */
export const useBillingEmails = () => {
  const authCtx = useContext(AuthContext);

  const sendOrderConfirmationEmail = async (
    orderData,
    recipientEmail = null
  ) => {
    try {
      // Determine recipient email
      let targetEmail = recipientEmail;

      // For authenticated users, use their email from context or orderData
      if (authCtx.isAuthenticated && !targetEmail) {
        targetEmail = orderData.customerEmail || authCtx.userEmail;
      }

      // For guest users, use email from orderData
      if (!targetEmail) {
        targetEmail = orderData.customerEmail || orderData.guestEmail;
      }

      if (!targetEmail) {
        throw new Error("No recipient email provided for order confirmation");
      }

      const emailData = {
        to: [targetEmail],
        message: {
          subject: `Order Confirmation - ${orderData.orderNum} | Build Bharat Mart`,
          html: EmailTemplates.orderConfirmationTemplate(orderData),
          text: `Order confirmation for ${orderData.orderNum}. Total: ₹${orderData.orderTotal}. Thank you for your order!`,
        },
        template: {
          type: "order_confirmation",
          version: "1.0",
        },
        metadata: {
          userId: authCtx.userId || "guest",
          emailType: "order_confirmation",
          orderNum: orderData.orderNum,
          orderTotal: orderData.orderTotal,
          customerType: authCtx.isAuthenticated ? "registered" : "guest",
        },
      };

      const result = await EmailService.sendEmail(emailData);

      if (result.success) {
        console.log(
          `✅ Order confirmation email sent for order ${orderData.orderNum} to ${targetEmail}`
        );
      } else {
        console.error(`❌ Failed to send order confirmation: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error("❌ Order confirmation email error:", error);
      return { success: false, error: error.message };
    }
  };

  const sendOrderShippedEmail = async (orderData, recipientEmail = null) => {
    try {
      let targetEmail =
        recipientEmail || orderData.customerEmail || orderData.guestEmail;

      if (!targetEmail) {
        throw new Error(
          "No recipient email provided for shipping notification"
        );
      }

      const emailData = {
        to: [targetEmail],
        message: {
          subject: `Your Order is Shipped - ${orderData.orderNum} | Build Bharat Mart`,
          html: EmailTemplates.orderShippedTemplate(orderData),
          text: `Your order ${orderData.orderNum} has been shipped! Tracking: ${orderData.trackingNumber}`,
        },
        template: {
          type: "order_shipped",
          version: "1.0",
        },
        metadata: {
          userId: authCtx.userId || "guest",
          emailType: "order_shipped",
          orderNum: orderData.orderNum,
          trackingNumber: orderData.trackingNumber,
        },
      };

      const result = await EmailService.sendEmail(emailData);

      if (result.success) {
        console.log(
          `✅ Shipping notification sent for order ${orderData.orderNum}`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Shipping notification email error:", error);
      return { success: false, error: error.message };
    }
  };

  const sendReceiptEmail = async (orderData, recipientEmail = null) => {
    try {
      let targetEmail =
        recipientEmail || orderData.customerEmail || orderData.guestEmail;

      if (!targetEmail) {
        throw new Error("No recipient email provided for receipt");
      }

      // Generate receipt template (extend the order confirmation template)
      const receiptHtml = EmailTemplates.generateBaseTemplate(`
        <h2>Receipt for Order ${orderData.orderNum} 🧾</h2>
        <p>Hi ${orderData.customerName},</p>
        <p>Here's your receipt for your recent purchase from Build Bharat Mart.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Details</h3>
          <p><strong>Order Number:</strong> ${orderData.orderNum}</p>
          <p><strong>Payment Method:</strong> ${
            orderData.paymentMethod || "Card"
          }</p>
          <p><strong>Transaction ID:</strong> ${
            orderData.transactionId || "N/A"
          }</p>
          <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="total">
          Amount Paid: ₹${orderData.orderTotal}
        </div>

        <p>This receipt is for your records. If you need any assistance, please contact our support team.</p>
      `);

      const emailData = {
        to: [targetEmail],
        message: {
          subject: `Receipt for Order ${orderData.orderNum} | Build Bharat Mart`,
          html: receiptHtml,
          text: `Receipt for order ${orderData.orderNum}. Amount paid: ₹${orderData.orderTotal}.`,
        },
        template: {
          type: "receipt",
          version: "1.0",
        },
        metadata: {
          userId: authCtx.userId || "guest",
          emailType: "receipt",
          orderNum: orderData.orderNum,
          orderTotal: orderData.orderTotal,
        },
      };

      return await EmailService.sendEmail(emailData);
    } catch (error) {
      console.error("❌ Receipt email error:", error);
      return { success: false, error: error.message };
    }
  };

  // Automatically trigger order confirmation email after successful order placement
  const triggerOrderConfirmationEmail = async (orderData) => {
    console.log("🔔 Triggering automatic order confirmation email...");
    return await sendOrderConfirmationEmail(orderData);
  };

  return {
    sendOrderConfirmationEmail,
    sendOrderShippedEmail,
    sendReceiptEmail,
    triggerOrderConfirmationEmail,
  };
};
