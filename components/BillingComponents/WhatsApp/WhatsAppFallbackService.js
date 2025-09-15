import { Linking, Alert } from "react-native";

/**
 * WhatsApp Fallback Service
 * Handles manual/deep link methods for WhatsApp messaging
 * NOTE: These methods require manual user interaction and are less user-friendly
 */
class WhatsAppFallbackService {
  constructor() {
    // console.log("📱 WhatsApp Fallback Service initialized");
  }

  /**
   * MANUAL METHOD: Open WhatsApp app with pre-filled message (requires manual send)
   * @param {string} phone - Phone number in international format without +
   * @param {string} message - Message text
   * @returns {Promise<Object>} Result object
   */
  /* COMMENTED OUT - NON USER FRIENDLY MANUAL METHOD
  async openWhatsAppWithMessage(phone, message) {
    try {
      const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(
        message
      )}`;

      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        console.log("📱 Opened WhatsApp app with pre-filled message");
        return {
          success: true,
          method: "deep_link",
          message: "WhatsApp opened with pre-filled message (manual send required)"
        };
      } else {
        throw new Error("WhatsApp is not installed");
      }
    } catch (error) {
      console.error("❌ Error opening WhatsApp:", error);
      Alert.alert("Error", "WhatsApp is not installed on this device");
      return {
        success: false,
        error: "WhatsApp not available"
      };
    }
  }
  */

  /**
   * MANUAL METHOD: Send order confirmation via deep link (requires manual send)
   * @param {string} recipientPhoneNumber - Phone number
   * @param {Object} orderDetails - Order details
   * @returns {Promise<Object>} Result object
   */
  /* COMMENTED OUT - NON USER FRIENDLY MANUAL METHOD
  async sendOrderConfirmationViaDeepLink(recipientPhoneNumber, orderDetails) {
    try {
      const message = this.generateOrderConfirmationMessage(orderDetails);
      
      console.log("📱 Attempting WhatsApp deep link for order confirmation...");
      
      const result = await this.openWhatsAppWithMessage(recipientPhoneNumber, message);
      
      if (result.success) {
        console.log("📱 WhatsApp opened with order confirmation message");
        return {
          success: true,
          method: "deep_link_manual",
          message: "WhatsApp opened with order confirmation (manual send required)"
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("❌ Error with WhatsApp deep link:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  */

  /**
   * Generate order confirmation message text
   * @param {Object} orderDetails - Order details
   * @returns {string} Formatted message
   */
  generateOrderConfirmationMessage(orderDetails) {
    return `🎉 Order Confirmation - Build Bharat Mart

Hi ${orderDetails.customerName}!

Your order has been confirmed successfully! 

📦 Order Number: ${orderDetails.orderNumber}
💰 Total Amount: ₹${orderDetails.total}
📍 Delivery Address: ${orderDetails.address}
📞 Contact: ${orderDetails.phone}

${orderDetails.items
  .map((item) => `• ${item.name} x ${item.quantity}`)
  .join("\n")}

Expected Delivery: 3-5 business days

Track your order: ${orderDetails.trackingLink || "Will be updated soon"}

Thank you for choosing Build Bharat Mart! 🛍️

For support: +91-XXXXXXXXXX`;
  }

  /**
   * MANUAL METHOD: Test deep link functionality
   * @param {string} phone - Test phone number
   * @param {string} message - Test message
   * @returns {Promise<Object>} Result object
   */
  /* COMMENTED OUT - NON USER FRIENDLY MANUAL METHOD
  async testDeepLink(phone, message) {
    try {
      console.log("🧪 Testing WhatsApp deep link...");
      const result = await this.openWhatsAppWithMessage(phone, message);
      
      if (result.success) {
        Alert.alert(
          "Deep Link Test",
          "WhatsApp should open with a pre-filled message. You'll need to tap the send button manually."
        );
      }
      
      return result;
    } catch (error) {
      console.error("❌ Deep link test failed:", error);
      Alert.alert("Error", "Failed to open WhatsApp");
      return {
        success: false,
        error: error.message
      };
    }
  }
  */

  /**
   * Check if WhatsApp is available on the device
   * @returns {Promise<boolean>} True if WhatsApp is available
   */
  async isWhatsAppAvailable() {
    try {
      const url = "whatsapp://";
      return await Linking.canOpenURL(url);
    } catch (error) {
      console.error("❌ Error checking WhatsApp availability:", error);
      return false;
    }
  }

  /**
   * Get information about fallback methods
   * @returns {Object} Information about available fallback methods
   */
  getFallbackInfo() {
    return {
      available: false, // Set to false since methods are commented out
      methods: [
        {
          name: "Deep Link",
          description:
            "Opens WhatsApp with pre-filled message (manual send required)",
          userFriendly: false,
          status: "commented_out",
        },
      ],
      note: "Manual methods are commented out due to poor user experience",
    };
  }
}

export default WhatsAppFallbackService;
