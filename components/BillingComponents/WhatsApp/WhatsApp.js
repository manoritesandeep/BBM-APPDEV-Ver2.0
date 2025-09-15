import whatsAppService from "./WhatsAppService";

/**
 * WhatsApp Business Cloud API Service - Refactored
 * This file now serves as the main entry point for WhatsApp messaging
 * The functionality has been split into separate service components:
 * - WhatsAppAPIService: Core API configuration
 * - WhatsAppTemplateService: Template-based messaging
 * - WhatsAppTextService: Text message service
 * - WhatsAppFallbackService: Manual/deep link methods (commented out)
 * - WhatsAppService: Main orchestrator service
 */

// Export the service instance and key methods for backward compatibility
export default whatsAppService;

// Named exports for backward compatibility
export const sendOrderConfirmation = (phone, orderDetails) =>
  whatsAppService.sendOrderConfirmation(phone, orderDetails);

export const sendTextMessage = (phone, message) =>
  whatsAppService.sendTextMessage(phone, message);

/* COMMENTED OUT - NON USER FRIENDLY MANUAL METHODS
// These methods require manual user interaction and provide poor UX
export const sendWhatsAppMessage = (phone, message) =>
  whatsAppService.openWhatsAppWithMessage(phone, message);
*/
