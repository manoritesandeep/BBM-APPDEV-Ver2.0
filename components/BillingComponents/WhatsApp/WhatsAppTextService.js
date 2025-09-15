import axios from "axios";
import WhatsAppAPIService from "./WhatsAppAPIService";

/**
 * WhatsApp Text Message Service
 * Handles sending custom text messages via WhatsApp Business API
 */
class WhatsAppTextService extends WhatsAppAPIService {
  constructor() {
    super();
  }

  /**
   * Send custom text message via WhatsApp Business API
   * @param {string} recipientPhoneNumber - Phone number in international format
   * @param {string} message - Text message to send
   * @returns {Promise<Object>} Result object with success status and data
   */
  async sendTextMessage(recipientPhoneNumber, message) {
    try {
      if (!this.isConfigured()) {
        throw new Error("WhatsApp API is not properly configured");
      }

      console.log("📱 Attempting text message to:", recipientPhoneNumber);

      const messagePayload = this.buildTextPayload(
        recipientPhoneNumber,
        message
      );

      console.log(
        "📱 Text message payload:",
        JSON.stringify(messagePayload, null, 2)
      );

      const response = await axios.post(this.baseUrl, messagePayload, {
        headers: this.getHeaders(),
      });

      console.log("✅ WhatsApp text message sent successfully!", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      this.logError("text message", error);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Build text message payload
   * @param {string} recipientPhoneNumber - Phone number
   * @param {string} message - Message text
   * @returns {Object} Text message payload
   */
  buildTextPayload(recipientPhoneNumber, message) {
    return {
      messaging_product: "whatsapp",
      to: recipientPhoneNumber,
      type: "text",
      text: {
        body: message,
      },
    };
  }

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
   * Send order confirmation as text message
   * @param {string} recipientPhoneNumber - Phone number
   * @param {Object} orderDetails - Order details
   * @returns {Promise<Object>} Result object
   */
  async sendOrderConfirmationText(recipientPhoneNumber, orderDetails) {
    const message = this.generateOrderConfirmationMessage(orderDetails);
    return await this.sendTextMessage(recipientPhoneNumber, message);
  }
}

export default WhatsAppTextService;
