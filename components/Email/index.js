// Email Service Core
export { EmailService } from "./EmailService";
export { EmailTemplates } from "./EmailTemplates";

// User Email Components & Hooks
export { useUserEmails } from "./User/useUserEmails";
export { default as SendWelcomeEmail } from "./User/SendWelcomeEmail";

// Billing Email Components & Hooks
export { useBillingEmails } from "./Billing/useBillingEmails";
export { default as SendOrderConfirmationEmail } from "./Billing/SendOrderConfirmationEmail";

// Integration Hook
export { useEmailIntegration } from "../../hooks/useEmailIntegration";

// Demo Component
// export { default as EmailSystemDemo } from "./EmailSystemDemo";

/**
 * Main Email System API
 *
 * Usage Examples:
 *
 * 1. Send Welcome Email (Auto-trigger on signup):
 * ```jsx
 * import { SendWelcomeEmail } from '../components/Email';
 *
 * // Auto-send on user registration
 * <SendWelcomeEmail
 *   userEmail="user@example.com"
 *   userName="John Doe"
 *   autoSend={true}
 *   onEmailSent={(result) => console.log('Welcome email sent:', result)}
 * />
 * ```
 *
 * 2. Send Order Confirmation (Auto-trigger on order placement):
 * ```jsx
 * import { useBillingEmails } from '../components/Email';
 *
 * const { triggerOrderConfirmationEmail } = useBillingEmails();
 *
 * // In your order completion logic
 * await triggerOrderConfirmationEmail(orderData);
 * ```
 *
 * 3. Manual Email Sending:
 * ```jsx
 * import { EmailService, EmailTemplates } from '../components/Email';
 *
 * const emailData = {
 *   to: ['user@example.com'],
 *   message: {
 *     subject: 'Custom Subject',
 *     html: EmailTemplates.welcomeTemplate('John'),
 *   }
 * };
 *
 * const result = await EmailService.sendEmail(emailData);
 * ```
 */
