import { Platform } from "react-native";

/**
 * Phone Authentication Error Handler
 * Provides user-friendly error messages and actionable suggestions
 */

export const PhoneAuthErrorTypes = {
  INVALID_PHONE: "INVALID_PHONE",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  INVALID_CODE: "INVALID_CODE",
  CODE_EXPIRED: "CODE_EXPIRED",
  NETWORK_ERROR: "NETWORK_ERROR",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  RECAPTCHA_ERROR: "RECAPTCHA_ERROR",
  VERIFICATION_FAILED: "VERIFICATION_FAILED",
  APP_NOT_AUTHORIZED: "APP_NOT_AUTHORIZED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

export const getPhoneAuthErrorDetails = (error, context = "verification") => {
  const errorCode = error?.code || "";
  const errorMessage = error?.message || "";

  // Console log for debugging
  console.log("🔍 Phone Auth Error Details:", {
    code: errorCode,
    message: errorMessage,
    context,
    platform: Platform.OS,
  });

  switch (errorCode) {
    case "auth/invalid-phone-number":
      return {
        type: PhoneAuthErrorTypes.INVALID_PHONE,
        title: "Invalid Phone Number",
        message:
          "Please enter a valid phone number with country code (e.g., +1234567890).",
        actionable: true,
        suggestions: [
          "Make sure to include the country code (e.g., +1 for US)",
          "Remove any spaces, dashes, or special characters",
          "Double-check the number format",
        ],
        retry: true,
        icon: "call-outline",
      };

    case "auth/too-many-requests":
      return {
        type: PhoneAuthErrorTypes.TOO_MANY_REQUESTS,
        title: "Too Many Requests",
        message:
          "You've made too many verification requests. Please wait a few minutes before trying again.",
        actionable: true,
        suggestions: [
          "Wait 5-10 minutes before requesting another code",
          "Try using a different phone number",
          "Check if you already received a valid code",
        ],
        retry: true,
        retryDelay: 300000, // 5 minutes
        icon: "time-outline",
      };

    case "auth/invalid-verification-code":
      return {
        type: PhoneAuthErrorTypes.INVALID_CODE,
        title: "Invalid Verification Code",
        message:
          "The code you entered is incorrect. Please check and try again.",
        actionable: true,
        suggestions: [
          "Double-check the 6-digit code from your SMS",
          "Make sure you're entering the most recent code",
          "Try requesting a new code if this one is old",
        ],
        retry: true,
        icon: "keypad-outline",
      };

    case "auth/code-expired":
    case "auth/session-expired":
      return {
        type: PhoneAuthErrorTypes.CODE_EXPIRED,
        title: "Code Expired",
        message: "The verification code has expired. Please request a new one.",
        actionable: true,
        suggestions: [
          "Request a new verification code",
          "Enter the code within 5 minutes of receiving it",
          "Check for any delays in SMS delivery",
        ],
        retry: true,
        forceResend: true,
        icon: "refresh-outline",
      };

    case "auth/network-request-failed":
    case "auth/network-error":
      return {
        type: PhoneAuthErrorTypes.NETWORK_ERROR,
        title: "Network Error",
        message:
          "Unable to connect to our servers. Please check your internet connection and try again.",
        actionable: true,
        suggestions: [
          "Check your internet connection",
          "Try switching between Wi-Fi and mobile data",
          "Wait a moment and try again",
        ],
        retry: true,
        icon: "wifi-outline",
      };

    case "auth/quota-exceeded":
      return {
        type: PhoneAuthErrorTypes.QUOTA_EXCEEDED,
        title: "Service Temporarily Unavailable",
        message:
          "SMS verification is temporarily unavailable. Please try again later.",
        actionable: true,
        suggestions: [
          "Try again in a few hours",
          "Use a different authentication method if available",
          "Contact support if the issue persists",
        ],
        retry: true,
        retryDelay: 3600000, // 1 hour
        icon: "alert-circle-outline",
      };

    case "auth/app-not-authorized":
    case "auth/app-not-verified":
      return {
        type: PhoneAuthErrorTypes.APP_NOT_AUTHORIZED,
        title: "App Verification Issue",
        message:
          "There's a temporary verification issue with the app. Please try again in a few moments.",
        actionable: true,
        suggestions: [
          "Wait a few moments and try again",
          "Make sure you have the latest app version",
          "Restart the app if the issue persists",
        ],
        retry: true,
        icon: "shield-outline",
      };

    case "auth/captcha-check-failed":
    case "auth/recaptcha-not-enabled":
      return {
        type: PhoneAuthErrorTypes.RECAPTCHA_ERROR,
        title: "Security Verification Required",
        message:
          "A brief security check is required. This helps us prevent automated abuse.",
        actionable: true,
        suggestions: [
          "Complete the security verification when prompted",
          "This is a one-time verification for your safety",
          "The process will be quick and automatic",
        ],
        retry: true,
        icon: "shield-checkmark-outline",
      };

    default:
      // Handle generic verification failures
      if (errorMessage.toLowerCase().includes("verification")) {
        return {
          type: PhoneAuthErrorTypes.VERIFICATION_FAILED,
          title: "Verification Failed",
          message:
            "Phone verification couldn't be completed. Please try again.",
          actionable: true,
          suggestions: [
            "Make sure you have a stable internet connection",
            "Try requesting a new verification code",
            "Restart the app if the issue persists",
          ],
          retry: true,
          icon: "alert-circle-outline",
        };
      }

      // Handle reCAPTCHA related errors
      if (
        errorMessage.toLowerCase().includes("recaptcha") ||
        errorMessage.toLowerCase().includes("captcha")
      ) {
        return {
          type: PhoneAuthErrorTypes.RECAPTCHA_ERROR,
          title: "Security Verification",
          message:
            "A security verification step is required to prevent automated requests.",
          actionable: true,
          suggestions: [
            "This helps protect against spam and abuse",
            "The verification will complete automatically",
            "Your privacy and security are our priority",
          ],
          retry: true,
          icon: "shield-checkmark-outline",
        };
      }

      return {
        type: PhoneAuthErrorTypes.UNKNOWN_ERROR,
        title: "Something Went Wrong",
        message: "We encountered an unexpected issue. Please try again.",
        actionable: true,
        suggestions: [
          "Try again in a few moments",
          "Check your internet connection",
          "Restart the app if the issue persists",
        ],
        retry: true,
        icon: "help-circle-outline",
        debugInfo: {
          code: errorCode,
          message: errorMessage,
        },
      };
  }
};

/**
 * Get user-friendly button configuration for error alerts
 */
export const getErrorAlertButtons = (
  errorDetails,
  onRetry,
  onCancel,
  onAlternative
) => {
  const buttons = [];

  // Always include a dismiss/cancel button
  buttons.push({
    text: "OK",
    style: "cancel",
    onPress: onCancel,
  });

  // Add retry button if retry is possible
  if (errorDetails.retry && onRetry) {
    buttons.unshift({
      text: errorDetails.forceResend ? "Send New Code" : "Try Again",
      style: "default",
      onPress: onRetry,
    });
  }

  // Add alternative action if available
  if (
    onAlternative &&
    (errorDetails.type === PhoneAuthErrorTypes.TOO_MANY_REQUESTS ||
      errorDetails.type === PhoneAuthErrorTypes.QUOTA_EXCEEDED)
  ) {
    buttons.splice(1, 0, {
      text: "Use Different Method",
      style: "default",
      onPress: onAlternative,
    });
  }

  return buttons;
};

/**
 * Format error message with context-specific information
 */
export const formatErrorMessage = (errorDetails, phoneNumber) => {
  let message = errorDetails.message;

  if (phoneNumber && errorDetails.type === PhoneAuthErrorTypes.CODE_EXPIRED) {
    message += `\n\nWe'll send a new code to ${phoneNumber}.`;
  }

  if (errorDetails.suggestions && errorDetails.suggestions.length > 0) {
    message += "\n\nTips:";
    errorDetails.suggestions.forEach((suggestion, index) => {
      message += `\n• ${suggestion}`;
    });
  }

  return message;
};

/**
 * Get appropriate retry delay based on error type
 */
export const getRetryDelay = (errorDetails) => {
  return errorDetails.retryDelay || 0;
};

/**
 * Check if error requires immediate user action
 */
export const requiresUserAction = (errorDetails) => {
  return (
    errorDetails.actionable &&
    (errorDetails.type === PhoneAuthErrorTypes.INVALID_PHONE ||
      errorDetails.type === PhoneAuthErrorTypes.INVALID_CODE)
  );
};
