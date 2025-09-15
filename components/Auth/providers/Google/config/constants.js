// Google Sign-In Configuration
export const GOOGLE_AUTH_CONFIG = {
  webClientId:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    "296739226456-5dbe829o3cus909ncd6r47q7q74pacjb.apps.googleusercontent.com",
  // androidClientId: "",
  iosClientId:
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    "296739226456-5dbe829o3cus909ncd6r47q7q74pacjb.apps.googleusercontent.com",
};

// You can add more authentication related constants here
export const AUTH_ERRORS = {
  SIGN_IN_CANCELLED: "User cancelled the login flow",
  IN_PROGRESS: "Operation (e.g. sign in) is in progress already",
  PLAY_SERVICES_NOT_AVAILABLE: "Play services not available or outdated",
  SIGN_IN_REQUIRED: "Useful only for requests that do not use auth",
};
