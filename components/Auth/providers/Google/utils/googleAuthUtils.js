import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

/**
 * Check if user is currently signed in
 */
export const isSignedIn = async () => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    return isSignedIn;
  } catch (error) {
    console.error("Error checking sign-in status:", error);
    return false;
  }
};

/**
 * Get current user info if signed in
 */
export const getCurrentUser = async () => {
  try {
    const currentUser = await GoogleSignin.getCurrentUser();
    return currentUser;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Get user's tokens
 */
export const getTokens = async () => {
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens;
  } catch (error) {
    console.error("Error getting tokens:", error);
    return null;
  }
};

/**
 * Handle Google Sign-In errors
 */
export const handleGoogleSignInError = (error) => {
  switch (error.code) {
    case statusCodes.SIGN_IN_CANCELLED:
      return "User cancelled the login flow";
    case statusCodes.IN_PROGRESS:
      return "Operation (e.g. sign in) is in progress already";
    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      return "Play services not available or outdated";
    case statusCodes.SIGN_IN_REQUIRED:
      return "Useful only for requests that do not use auth";
    default:
      return error.message || "An unknown error occurred";
  }
};

/**
 * Clear all Google Sign-In data
 */
export const clearGoogleSignInData = async () => {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    return true;
  } catch (error) {
    console.error("Error clearing Google Sign-In data:", error);
    return false;
  }
};
