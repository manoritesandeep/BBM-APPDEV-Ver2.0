// Facebook Sign-In Configuration
export const FACEBOOK_AUTH_CONFIG = {
  appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "1268209811682586",
  // Add other Facebook configuration if needed
};

// Facebook-specific error messages
export const FACEBOOK_AUTH_ERRORS = {
  USER_CANCELLED: "User cancelled the Facebook login flow",
  NETWORK_ERROR: "Network error occurred during Facebook login",
  ACCESS_DENIED: "Access denied for Facebook login",
  UNKNOWN_ERROR: "An unknown error occurred during Facebook login",
};

// Facebook Graph API fields to request
export const FACEBOOK_PROFILE_FIELDS = [
  "id",
  "name",
  "email",
  "picture.type(large)",
  "first_name",
  "last_name",
];
