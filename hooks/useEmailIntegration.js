import { useContext } from "react";
import { useBillingEmails } from "../components/Email/Billing/useBillingEmails";
import { useUserEmails } from "../components/Email/User/useUserEmails";
import { AuthContext } from "../store/auth-context";

/**
 * Integration hook for automatically triggering emails during app flows
 * Use this in billing, auth, and other components to trigger emails automatically
 */
export const useEmailIntegration = () => {
  const authCtx = useContext(AuthContext);
  const { triggerOrderConfirmationEmail, sendOrderShippedEmail } =
    useBillingEmails();
  const { sendWelcomeEmail } = useUserEmails();

  /**
   * Trigger order confirmation email automatically after order placement
   * Works for both authenticated and guest users
   */
  const handleOrderPlaced = async (orderData) => {
    console.log("🔔 Order placed, triggering confirmation email...");

    try {
      // Ensure we have required data
      if (!orderData.orderNum || !orderData.customerName) {
        console.warn("⚠️ Missing required order data for email");
        return { success: false, error: "Missing order data" };
      }

      // For guest users, ensure we have email
      if (
        !authCtx.isAuthenticated &&
        !orderData.guestEmail &&
        !orderData.customerEmail
      ) {
        console.warn("⚠️ No email provided for guest order");
        return { success: false, error: "No email provided for guest order" };
      }

      const result = await triggerOrderConfirmationEmail(orderData);

      if (result.success) {
        console.log(
          `✅ Order confirmation email sent for ${orderData.orderNum}`
        );
      } else {
        console.error(`❌ Failed to send order confirmation: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error("❌ Error in handleOrderPlaced:", error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Trigger welcome email automatically after user registration
   */
  const handleUserRegistered = async (userEmail, userName) => {
    console.log("🔔 User registered, triggering welcome email...");

    try {
      if (!userEmail || !userName) {
        console.warn("⚠️ Missing user email or name for welcome email");
        return { success: false, error: "Missing user data" };
      }

      const result = await sendWelcomeEmail(userEmail, userName);

      if (result.success) {
        console.log(`✅ Welcome email sent to ${userName} (${userEmail})`);
      } else {
        console.error(`❌ Failed to send welcome email: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error("❌ Error in handleUserRegistered:", error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Trigger shipping notification email when order status changes
   */
  const handleOrderShipped = async (orderData) => {
    console.log("🔔 Order shipped, triggering notification email...");

    try {
      if (!orderData.orderNum || !orderData.trackingNumber) {
        console.warn("⚠️ Missing order number or tracking number");
        return { success: false, error: "Missing shipping data" };
      }

      const result = await sendOrderShippedEmail(orderData);

      if (result.success) {
        console.log(`✅ Shipping notification sent for ${orderData.orderNum}`);
      }

      return result;
    } catch (error) {
      console.error("❌ Error in handleOrderShipped:", error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Batch email sending for multiple orders (admin use)
   */
  const handleBulkOrderNotifications = async (orders) => {
    console.log(`🔔 Sending bulk notifications for ${orders.length} orders...`);

    const results = [];

    for (const order of orders) {
      const result = await triggerOrderConfirmationEmail(order);
      results.push({ orderNum: order.orderNum, ...result });

      // Small delay to prevent overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(
      `✅ Bulk notification complete: ${successCount}/${orders.length} sent`
    );

    return results;
  };

  return {
    handleOrderPlaced,
    handleUserRegistered,
    handleOrderShipped,
    handleBulkOrderNotifications,
  };
};
