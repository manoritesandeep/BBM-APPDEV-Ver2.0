import WhatsAppTemplateService from "./WhatsAppTemplateService";
import WhatsAppTextService from "./WhatsAppTextService";
import WhatsAppFallbackService from "./WhatsAppFallbackService";

/**
 * Main WhatsApp Service
 * Orchestrates different WhatsApp messaging methods with intelligent fallback
 */
class WhatsAppService {
  constructor() {
    this.templateService = new WhatsAppTemplateService();
    this.textService = new WhatsAppTextService();
    this.fallbackService = new WhatsAppFallbackService();

    // console.log("🔧 WhatsApp Service initialized with component services");
  }

  /**
   * Send order confirmation with intelligent fallback strategy
   * Tries template first, then text message, then fallback methods (commented out)
   * @param {string} recipientPhoneNumber - Phone number in international format
   * @param {Object} orderDetails - Order details object
   * @returns {Promise<Object>} Result object with success status and method used
   */
  async sendOrderConfirmation(recipientPhoneNumber, orderDetails) {
    try {
      console.log("📱 Starting WhatsApp order confirmation process...");

      // Step 1: Try template message first (most professional)
      console.log("🎯 Attempting template-based message...");
      const templateResult =
        await this.templateService.sendOrderConfirmationTemplate(
          recipientPhoneNumber,
          orderDetails
        );

      if (templateResult.success) {
        console.log("✅ WhatsApp order confirmation sent via template!");
        return {
          success: true,
          method: "template",
          data: templateResult.data,
          message: "Order confirmation sent via WhatsApp Business template",
        };
      }

      console.log("⚠️ Template failed, trying text message...");

      // Step 2: Fallback to text message
      console.log("🎯 Attempting text message...");
      const textResult = await this.textService.sendOrderConfirmationText(
        recipientPhoneNumber,
        orderDetails
      );

      if (textResult.success) {
        console.log("✅ WhatsApp order confirmation sent as text message!");
        return {
          success: true,
          method: "text_message",
          data: textResult.data,
          message: "Order confirmation sent via WhatsApp text message",
        };
      }

      console.log("⚠️ Text message failed");

      // Step 3: Manual methods are commented out for better UX
      // Instead, return failure with helpful information
      return {
        success: false,
        method: "none",
        error: "WhatsApp API methods failed",
        message:
          "Unable to send automatic WhatsApp confirmation. Manual methods are disabled for better user experience.",
        fallbackInfo: this.fallbackService.getFallbackInfo(),
      };

      /* COMMENTED OUT - NON USER FRIENDLY FALLBACK
      console.log("⚠️ API methods failed, trying deep link fallback...");

      // Step 3: Final fallback to opening WhatsApp app (manual send required)
      const message = this.textService.generateOrderConfirmationMessage(orderDetails);
      const fallbackResult = await this.fallbackService.openWhatsAppWithMessage(
        recipientPhoneNumber,
        message
      );

      if (fallbackResult.success) {
        console.log("📱 Opened WhatsApp app with pre-filled message");
        return {
          success: true,
          method: "deep_link",
          message: "WhatsApp opened with pre-filled message (manual send required)"
        };
      }

      return {
        success: false,
        method: "all_failed",
        error: "All WhatsApp methods failed"
      };
      */
    } catch (error) {
      console.error("❌ Error in WhatsApp order confirmation process:", error);
      return {
        success: false,
        error: error.message,
        method: "error",
      };
    }
  }

  /**
   * Send custom text message via WhatsApp
   * @param {string} recipientPhoneNumber - Phone number
   * @param {string} message - Message text
   * @returns {Promise<Object>} Result object
   */
  async sendTextMessage(recipientPhoneNumber, message) {
    try {
      console.log("📱 Sending custom WhatsApp text message...");

      const result = await this.textService.sendTextMessage(
        recipientPhoneNumber,
        message
      );

      if (result.success) {
        return {
          success: true,
          method: "text_api",
          data: result.data,
        };
      }

      // Manual fallback is commented out
      /* COMMENTED OUT - NON USER FRIENDLY FALLBACK
      console.log("⚠️ API failed, trying fallback...");
      const fallbackResult = await this.fallbackService.openWhatsAppWithMessage(
        recipientPhoneNumber,
        message
      );
      
      return fallbackResult;
      */

      return {
        success: false,
        method: "api_failed",
        error: result.error,
        message: "WhatsApp API failed and manual methods are disabled",
      };
    } catch (error) {
      console.error("❌ Error sending WhatsApp text message:", error);
      return {
        success: false,
        error: error.message,
        method: "error",
      };
    }
  }

  /**
   * Get service status and configuration
   * @returns {Object} Service status information
   */
  getServiceStatus() {
    return {
      templateService: {
        configured: this.templateService.isConfigured(),
        templateName: this.templateService.templateName,
      },
      textService: {
        configured: this.textService.isConfigured(),
      },
      fallbackService: {
        info: this.fallbackService.getFallbackInfo(),
      },
      messageStatusChecking: {
        supported: false,
        reason:
          "WhatsApp Business API doesn't support direct message status checking",
        recommendation: "Use webhooks for message status updates",
        documentation: "See MESSAGE_STATUS_HANDLING.md for details",
      },
      overallStatus: this.templateService.isConfigured()
        ? "ready"
        : "needs_configuration",
    };
  }

  /**
   * Update template name for order confirmations
   * @param {string} templateName - New template name
   */
  setTemplateName(templateName) {
    this.templateService.setTemplateName(templateName);
  }

  /* COMMENTED OUT - NON USER FRIENDLY METHODS
  // Legacy methods for backward compatibility (commented out)
  
  async openWhatsAppWithMessage(phone, message) {
    console.warn("⚠️ openWhatsAppWithMessage is deprecated and commented out for better UX");
    return {
      success: false,
      method: "deprecated",
      message: "Manual WhatsApp methods are disabled for better user experience"
    };
  }

  async sendWhatsAppMessage(phone, message) {
    console.warn("⚠️ sendWhatsAppMessage is deprecated, use sendTextMessage instead");
    return await this.sendTextMessage(phone, message);
  }
  */
}

// Create singleton instance
const whatsAppService = new WhatsAppService();

// Export the service instance and key methods
export default whatsAppService;

// Named exports for backward compatibility
export const sendOrderConfirmation = (phone, orderDetails) =>
  whatsAppService.sendOrderConfirmation(phone, orderDetails);

export const sendTextMessage = (phone, message) =>
  whatsAppService.sendTextMessage(phone, message);

/* COMMENTED OUT - NON USER FRIENDLY EXPORTS
export const sendWhatsAppMessage = (phone, message) =>
  whatsAppService.openWhatsAppWithMessage(phone, message);
*/
