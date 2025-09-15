import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager,
} from "react-native-fbsdk-next";

/**
 * Check if user is currently signed in with Facebook
 */
export const isFacebookSignedIn = async () => {
  try {
    const accessToken = await AccessToken.getCurrentAccessToken();
    return !!accessToken;
  } catch (error) {
    console.error("Error checking Facebook sign-in status:", error);
    return false;
  }
};

/**
 * Get current Facebook access token
 */
export const getCurrentFacebookAccessToken = async () => {
  try {
    const accessToken = await AccessToken.getCurrentAccessToken();
    return accessToken;
  } catch (error) {
    console.error("Error getting Facebook access token:", error);
    return null;
  }
};

/**
 * Get Facebook user profile data using Graph API
 */
export const getFacebookUserProfile = async (
  accessToken,
  fields = ["id", "name", "email", "picture.type(large)"]
) => {
  return new Promise((resolve, reject) => {
    const infoRequest = new GraphRequest(
      "/me",
      {
        accessToken: accessToken,
        parameters: {
          fields: fields.join(","),
        },
      },
      (error, result) => {
        if (error) {
          console.error("Facebook Graph API error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    new GraphRequestManager().addRequest(infoRequest).start();
  });
};

/**
 * Handle Facebook authentication errors
 */
export const handleFacebookAuthError = (error) => {
  if (!error) return "Unknown Facebook authentication error";

  // Handle string errors
  if (typeof error === "string") {
    if (error.includes("User cancelled")) {
      return "User cancelled the Facebook login flow";
    }
    return error;
  }

  // Handle error objects
  if (error.message) {
    if (error.message.includes("User cancelled")) {
      return "User cancelled the Facebook login flow";
    }
    if (error.message.includes("network")) {
      return "Network error occurred during Facebook login";
    }
    if (error.message.includes("access_denied")) {
      return "Access denied for Facebook login";
    }
    return error.message;
  }

  return "An unknown error occurred during Facebook login";
};

/**
 * Clear all Facebook Sign-In data
 */
export const clearFacebookSignInData = async () => {
  try {
    await LoginManager.logOut();
    return true;
  } catch (error) {
    console.error("Error clearing Facebook Sign-In data:", error);
    return false;
  }
};

/**
 * Request Facebook login with specified permissions
 */
export const requestFacebookLogin = async (
  permissions = ["public_profile", "email"]
) => {
  try {
    const result = await LoginManager.logInWithPermissions(permissions);

    if (result.isCancelled) {
      throw new Error("User cancelled the Facebook login flow");
    }

    return result;
  } catch (error) {
    console.error("Facebook login request error:", error);
    throw error;
  }
};
