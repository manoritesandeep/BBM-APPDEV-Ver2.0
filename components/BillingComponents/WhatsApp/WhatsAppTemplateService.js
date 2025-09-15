import axios from "axios";
import WhatsAppAPIService from "./WhatsAppAPIService";

/**
 * WhatsApp Template Message Service
 * Handles sending messages using approved WhatsApp Business templates
 */
class WhatsAppTemplateService extends WhatsAppAPIService {
  constructor() {
    super();
    this.templateName = "orderconfirmation"; // Update this to match your approved template name
    // this.templateName = "order_confirmation_bbmtest"; // Update this to match your approved template name
  }

  /**
   * Send order confirmation using WhatsApp Business API template
   * @param {string} recipientPhoneNumber - Phone number in international format
   * @param {Object} orderDetails - Order details object
   * @returns {Promise<Object>} Result object with success status and data
   */
  async sendOrderConfirmationTemplate(recipientPhoneNumber, orderDetails) {
    try {
      if (!this.isConfigured()) {
        throw new Error("WhatsApp API is not properly configured");
      }

      console.log("📱 Attempting template message to:", recipientPhoneNumber);

      const messagePayload = this.buildTemplatePayload(
        recipientPhoneNumber,
        orderDetails
      );

      // console.log(
      //   "📱 Template message payload:",
      //   JSON.stringify(messagePayload, null, 2)
      // );

      const response = await axios.post(this.baseUrl, messagePayload, {
        headers: this.getHeaders(),
      });

      // console.log(
      //   "✅ WhatsApp template message sent successfully!",
      //   response.data
      // );

      // Note: WhatsApp Business API doesn't support direct message status checking
      // Status updates are typically received via webhooks, not polling
      // Commenting out status check to avoid unsupported API errors
      // this.scheduleStatusCheck(response.data);

      return { success: true, data: response.data };
    } catch (error) {
      this.logError("template message", error);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Build template message payload
   * @param {string} recipientPhoneNumber - Phone number
   * @param {Object} orderDetails - Order details
   * @returns {Object} Template message payload
   */
  buildTemplatePayload(recipientPhoneNumber, orderDetails) {
    // console.log("Order details (template): ", orderDetails);

    // // Build a readable list from items array
    // const itemsArray = Array.isArray(orderDetails.items)
    //   ? orderDetails.items
    //   : [];
    // const itemsText = itemsArray
    //   .map((it, idx) => {
    //     const name = it?.name ?? `Item ${idx + 1}`;
    //     const qty = it?.quantity ?? 1;
    //     const price = typeof it?.price !== "undefined" ? `₹${it.price}` : "";
    //     return `${idx + 1}. ${name} x${qty} ${price}`.trim();
    //   })
    //   .join("\n");

    const itemsCount = String(orderDetails.items.length);

    return {
      messaging_product: "whatsapp",
      to: recipientPhoneNumber,
      type: "template",
      template: {
        name: this.templateName,
        language: {
          code: "en",
        },
        components: [
          {
            type: "body",
            // parameters: [
            //   { type: "text", text: orderDetails.customerName }, // Parameter {{1}}
            //   { type: "text", text: orderDetails.orderNumber }, // Parameter {{2}}
            //   { type: "text", text: `₹${orderDetails.total}` }, // Parameter {{3}}
            // ],
            parameters: [
              { type: "text", text: orderDetails.customerName }, // Parameter {{1}}
              { type: "text", text: orderDetails.orderNumber }, // Parameter {{2}}
              { type: "text", text: `₹${orderDetails.total}` }, // Parameter {{3}}
              { type: "text", text: orderDetails.address }, // Parameter {{4}}
              { type: "text", text: orderDetails.phone }, // Parameter {{5}}
              // { type: "text", text: itemsText }, // Parameter {{6}} -> formatted list
              { type: "text", text: itemsCount }, // Parameter {{6}} -> formatted list
            ],
          },
        ],
      },
    };
  }

  /**
   * Schedule message status check
   * NOTE: Disabled - WhatsApp Business API doesn't support direct message status checking
   * Status updates should be received via webhooks instead
   * @param {Object} responseData - Response from WhatsApp API
   */
  scheduleStatusCheck(responseData) {
    // DISABLED: Direct message status checking is not supported by WhatsApp Business API
    // The API returns error: "Unsupported get request" when trying to check individual message status
    // Message status updates should be handled via webhooks if needed

    console.log(
      "ℹ️ Message status checking is disabled (not supported by WhatsApp Business API)"
    );
    console.log(
      "💡 For message status updates, implement webhook listeners instead"
    );

    /* COMMENTED OUT - NOT SUPPORTED BY WHATSAPP BUSINESS API
    if (responseData.messages && responseData.messages[0]) {
      setTimeout(() => {
        this.checkMessageStatus(responseData.messages[0].id);
      }, 5000);
    }
    */
  }

  /**
   * Check message delivery status
   * NOTE: This method is not supported by WhatsApp Business API
   * Direct message status checking via Graph API returns "Unsupported get request" errors
   * Use webhooks for message status updates instead
   * @param {string} messageId - Message ID from WhatsApp API
   * @returns {Promise<Object|null>} Status data or null if failed
   */
  async checkMessageStatus(messageId) {
    console.warn(
      "⚠️ checkMessageStatus is not supported by WhatsApp Business API"
    );
    console.warn(
      "💡 Use webhook endpoints to receive message status updates instead"
    );

    return {
      status: "not_supported",
      message:
        "Direct message status checking is not supported by WhatsApp Business API",
      recommendation: "Implement webhook listeners for message status updates",
    };

    /* COMMENTED OUT - NOT SUPPORTED BY WHATSAPP BUSINESS API
    try {
      const statusUrl = this.getStatusUrl(messageId);

      const response = await axios.get(statusUrl, {
        headers: this.getHeaders(),
      });

      console.log("📋 Message status:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error checking message status:", error.response?.data);
      return null;
    }
    */
  }

  /**
   * Update template name for different template types
   * @param {string} templateName - New template name
   */
  setTemplateName(templateName) {
    this.templateName = templateName;
  }
}

export default WhatsAppTemplateService;
