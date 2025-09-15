import {
  EXPO_PUBLIC_CLOUD_API_VERSION,
  WA_PHONE_NUMBER_ID,
  CLOUD_API_ACCESS_TOKEN,
} from "@env";

/**
 * WhatsApp Business Cloud API Base Service
 * Handles core API configuration and common functionality
 */
class WhatsAppAPIService {
  constructor() {
    this.baseUrl = `https://graph.facebook.com/${EXPO_PUBLIC_CLOUD_API_VERSION}/${WA_PHONE_NUMBER_ID}/messages`;
    this.accessToken = CLOUD_API_ACCESS_TOKEN;
    this.apiVersion = EXPO_PUBLIC_CLOUD_API_VERSION;
    this.phoneNumberId = WA_PHONE_NUMBER_ID;

    // Validate configuration
    this.validateConfiguration();
  }

  /**
   * Validate WhatsApp API configuration
   */
  validateConfiguration() {
    if (!this.accessToken) {
      console.warn("⚠️ WhatsApp Cloud API access token is missing");
    }
    if (!this.phoneNumberId) {
      console.warn("⚠️ WhatsApp phone number ID is missing");
    }
    if (!this.apiVersion) {
      console.warn("⚠️ WhatsApp API version is missing");
    }
  }

  /**
   * Get common headers for API requests
   */
  getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Check if API is properly configured
   */
  isConfigured() {
    return Boolean(this.accessToken && this.phoneNumberId && this.apiVersion);
  }

  /**
   * Get message status URL
   * NOTE: Direct message status checking is not supported by WhatsApp Business API
   * This method is kept for reference but should not be used
   * Use webhooks for message status updates instead
   */
  getStatusUrl(messageId) {
    console.warn(
      "⚠️ Direct message status checking is not supported by WhatsApp Business API"
    );
    return `https://graph.facebook.com/${this.apiVersion}/${messageId}`;
  }

  /**
   * Log API error details
   */
  logError(operation, error) {
    console.error(`❌ WhatsApp API Error (${operation}):`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      requestUrl: this.baseUrl,
    });
  }
}

export default WhatsAppAPIService;
