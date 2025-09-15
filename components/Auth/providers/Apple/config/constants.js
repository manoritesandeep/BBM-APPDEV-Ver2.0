// Apple Sign-In Configuration
export const APPLE_AUTH_CONFIG = {
  // Apple doesn't require explicit configuration like Google/Facebook
  // All configuration is handled through app.config.js and Apple Developer Portal
};

// Apple-specific error messages
export const APPLE_AUTH_ERRORS = {
  INVALID_RESPONSE: "Invalid response from Apple",
  USER_CANCELLED: "User cancelled the Apple login flow",
  AUTHORIZATION_FAILED: "Apple authorization failed",
  INVALID_CREDENTIALS: "Invalid Apple credentials",
  UNKNOWN_ERROR: "An unknown error occurred during Apple login",
  NOT_AVAILABLE: "Apple Sign-In is not available on this device",
  USER_NOT_FOUND: "Apple user not found",
  TOKEN_MISSING: "Apple identity token is missing",
};

// Apple identity token scopes
export const APPLE_SCOPES = {
  FULL_NAME: "fullName",
  EMAIL: "email",
};

// Apple real user status constants
export const APPLE_REAL_USER_STATUS = {
  UNKNOWN: 0,
  LIKELY_REAL: 1,
  UNSUPPORTED: 2,
};
