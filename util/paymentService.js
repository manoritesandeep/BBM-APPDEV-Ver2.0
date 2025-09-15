import { Alert } from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { RAZORPAY_API_KEY } from "@env";

/**
 * Payment Service - Handles all payment-related operations
 */
export class PaymentService {
  /**
   * Process Razorpay payment
   * @param {Object} paymentData - Payment configuration data
   * @param {number} paymentData.amount - Amount in rupees
   * @param {string} paymentData.orderId - Order ID for tracking
   * @param {Object} paymentData.userInfo - User information
   * @param {string} paymentData.userInfo.name - Customer name
   * @param {string} paymentData.userInfo.email - Customer email
   * @param {string} paymentData.userInfo.contact - Customer phone
   * @returns {Promise<Object>} Payment result with success/failure status
   */
  static async processRazorpayPayment(paymentData) {
    try {
      // Check if Razorpay API key is available
      if (!RAZORPAY_API_KEY) {
        throw new Error("Razorpay API key not configured");
      }

      // Ensure contact number is in correct format
      const contact = paymentData.userInfo.contact.replace(/\D/g, ""); // Remove non-digits
      const formattedContact = contact.length === 10 ? contact : "9999999999";

      const options = {
        description: `BBM Order #${paymentData.orderId}`,
        currency: "INR",
        key: RAZORPAY_API_KEY,
        amount: Math.round(paymentData.amount * 100), // Convert to paise and ensure integer
        name: "Build Bharat Mart",
        prefill: {
          email: paymentData.userInfo.email || "customer@buildbharatmart.com",
          contact: formattedContact,
          name: paymentData.userInfo.name || "Customer",
        },
        theme: {
          color: "#F37254",
        },
        notes: {
          order_id: paymentData.orderId,
          customer_email: paymentData.userInfo.email,
        },
      };

      console.log(
        "🚀 Opening Razorpay with options:",
        JSON.stringify(options, null, 2)
      );

      const paymentResult = await RazorpayCheckout.open(options);

      console.log("💳 Payment successful, extracting details:");
      console.log("- Payment ID:", paymentResult.razorpay_payment_id);
      console.log("- Our Order ID:", paymentData.orderId);
      console.log("- Razorpay Order ID:", paymentResult.razorpay_order_id);

      return {
        success: true,
        paymentId: paymentResult.razorpay_payment_id,
        orderId: paymentData.orderId, // Use our generated orderId, not Razorpay's
        signature: paymentResult.razorpay_signature,
        data: paymentResult,
      };
    } catch (error) {
      console.log("Razorpay Payment Error:", error);

      // Handle different types of errors
      if (error.code === 0) {
        // Payment cancelled
        return {
          success: false,
          error: "Payment was cancelled",
          cancelled: true,
          code: error.code,
        };
      } else if (error.code === 1) {
        // Payment failed
        return {
          success: false,
          error: `Payment failed: ${error.description}`,
          code: error.code,
          description: error.description,
        };
      } else {
        // Network or other errors
        return {
          success: false,
          error: "Payment processing failed. Please try again.",
          code: error.code,
          description: error.description || "Unknown error",
        };
      }
    }
  }

  /**
   * Validate payment data before processing
   * @param {Object} paymentData - Payment data to validate
   * @returns {Object} Validation result
   */
  static validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push("Invalid payment amount");
    }

    if (!paymentData.orderId) {
      errors.push("Order ID is required");
    }

    if (!paymentData.userInfo) {
      errors.push("User information is required");
    } else {
      if (!paymentData.userInfo.email) {
        errors.push("Email is required");
      }
      if (!paymentData.userInfo.contact) {
        errors.push("Phone number is required");
      }
      if (!paymentData.userInfo.name) {
        errors.push("Name is required");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Show payment result alert to user
   * @param {Object} result - Payment result
   * @param {Function} onSuccess - Callback for successful payment
   * @param {Function} onFailure - Callback for failed payment
   */
  static showPaymentResult(result, onSuccess, onFailure) {
    if (result.success) {
      Alert.alert(
        "Payment Successful! 🎉",
        `Your payment has been processed successfully.\n\nPayment ID: ${result.paymentId}`,
        [
          {
            text: "Continue",
            onPress: () => onSuccess && onSuccess(result),
          },
        ],
        { cancelable: false }
      );
    } else if (result.cancelled) {
      Alert.alert(
        "Payment Cancelled",
        "Your payment was cancelled. You can try again or choose a different payment method.",
        [
          {
            text: "Try Again",
            onPress: () => onFailure && onFailure(result, true),
          },
          {
            text: "Choose Different Method",
            style: "cancel",
            onPress: () => onFailure && onFailure(result, false),
          },
        ]
      );
    } else {
      Alert.alert(
        "Payment Failed",
        `${result.error}\n\nWould you like to try again?`,
        [
          {
            text: "Try Again",
            onPress: () => onFailure && onFailure(result, true),
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => onFailure && onFailure(result, false),
          },
        ]
      );
    }
  }

  /**
   * Format amount for display
   * @param {number} amount - Amount in rupees
   * @returns {string} Formatted amount string
   */
  static formatAmount(amount) {
    return `₹${amount.toFixed(2)}`;
  }

  /**
   * Generate a unique order ID (if not provided by backend)
   * @returns {string} Unique order ID
   */
  static generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BBM${timestamp}${random}`;
  }
}

/**
 * Payment method constants
 */
export const PAYMENT_METHODS = {
  COD: "cod",
  RAZORPAY: "razorpay",
};

/**
 * Payment status constants
 */
export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
};
