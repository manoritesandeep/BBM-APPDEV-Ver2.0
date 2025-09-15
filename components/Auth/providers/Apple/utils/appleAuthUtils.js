import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { APPLE_AUTH_ERRORS, APPLE_REAL_USER_STATUS } from "../config/constants";

/**
 * Check if Apple Sign-In is available on the current device
 */
export const isAppleSignInAvailable = async () => {
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch (error) {
    console.error("Error checking Apple Sign-In availability:", error);
    return false;
  }
};

/**
 * Get stored Apple credentials from secure storage
 */
export const getStoredAppleCredentials = async () => {
  try {
    const credentialJson = await SecureStore.getItemAsync("apple-credentials");
    return credentialJson ? JSON.parse(credentialJson) : null;
  } catch (error) {
    console.error("Error getting stored Apple credentials:", error);
    return null;
  }
};

/**
 * Store Apple credentials in secure storage
 */
export const storeAppleCredentials = async (credentials) => {
  try {
    await SecureStore.setItemAsync(
      "apple-credentials",
      JSON.stringify(credentials)
    );
    return true;
  } catch (error) {
    console.error("Error storing Apple credentials:", error);
    return false;
  }
};

/**
 * Clear Apple credentials from secure storage
 */
export const clearAppleCredentials = async () => {
  try {
    await SecureStore.deleteItemAsync("apple-credentials");
    return true;
  } catch (error) {
    console.error("Error clearing Apple credentials:", error);
    return false;
  }
};

/**
 * Request Apple sign-in with specified scopes
 */
export const requestAppleSignIn = async (
  scopes = [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ]
) => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: scopes,
    });

    if (!credential) {
      throw new Error(APPLE_AUTH_ERRORS.INVALID_RESPONSE);
    }

    // Store credentials securely
    await storeAppleCredentials(credential);

    return credential;
  } catch (error) {
    console.error("Apple sign-in request error:", error);
    if (error.code === "ERR_CANCELLED") {
      throw new Error(APPLE_AUTH_ERRORS.USER_CANCELLED);
    }
    throw error;
  }
};

/**
 * Refresh Apple credentials
 */
export const refreshAppleCredentials = async (user) => {
  try {
    if (!user) {
      throw new Error("User ID is required for refresh");
    }

    const refreshedCredential = await AppleAuthentication.refreshAsync({
      user: user,
    });

    if (refreshedCredential) {
      await storeAppleCredentials(refreshedCredential);
    }

    return refreshedCredential;
  } catch (error) {
    console.error("Error refreshing Apple credentials:", error);
    throw error;
  }
};

/**
 * Get Apple credential state for a user
 */
export const getAppleCredentialState = async (user) => {
  try {
    if (!user) {
      throw new Error("User ID is required for credential state check");
    }

    const credentialState = await AppleAuthentication.getCredentialStateAsync(
      user
    );
    return credentialState;
  } catch (error) {
    console.error("Error getting Apple credential state:", error);
    throw error;
  }
};

/**
 * Decode and validate Apple identity token
 */
export const decodeAppleIdentityToken = (identityToken) => {
  try {
    if (!identityToken) {
      throw new Error(APPLE_AUTH_ERRORS.TOKEN_MISSING);
    }

    const decoded = jwtDecode(identityToken);

    // Validate token expiration
    const current = Date.now() / 1000;
    const isExpired = current >= decoded.exp;

    return {
      decoded,
      isExpired,
      email: decoded.email || null,
      emailVerified: decoded.email_verified || false,
      subject: decoded.sub || null,
    };
  } catch (error) {
    console.error("Error decoding Apple identity token:", error);
    throw new Error(APPLE_AUTH_ERRORS.INVALID_CREDENTIALS);
  }
};

/**
 * Extract user information from Apple credential
 */
export const extractAppleUserInfo = (credential) => {
  try {
    if (!credential) {
      throw new Error(APPLE_AUTH_ERRORS.INVALID_RESPONSE);
    }

    const { decoded, isExpired, emailVerified } = decodeAppleIdentityToken(
      credential.identityToken
    );

    // Extract name information
    const fullName = credential.fullName || {};
    const displayName =
      fullName.givenName && fullName.familyName
        ? `${fullName.givenName} ${fullName.familyName}`.trim()
        : fullName.givenName || fullName.familyName || "";

    return {
      uid: decoded.sub,
      email: credential.email || decoded.email || "",
      name: displayName,
      firstName: fullName.givenName || "",
      lastName: fullName.familyName || "",
      emailVerified: emailVerified,
      provider: "apple",
      appleId: decoded.sub,
      realUserStatus:
        credential.realUserStatus || APPLE_REAL_USER_STATUS.UNKNOWN,
      authorizationCode: credential.authorizationCode,
      identityToken: credential.identityToken,
      user: credential.user,
      isTokenExpired: isExpired,
      rawCredential: credential,
    };
  } catch (error) {
    console.error("Error extracting Apple user info:", error);
    throw error;
  }
};

/**
 * Handle Apple authentication errors
 */
export const handleAppleAuthError = (error) => {
  if (!error) return APPLE_AUTH_ERRORS.UNKNOWN_ERROR;

  // Handle string errors
  if (typeof error === "string") {
    if (error.includes("cancelled")) {
      return APPLE_AUTH_ERRORS.USER_CANCELLED;
    }
    return error;
  }

  // Handle error objects
  if (error.message) {
    if (error.message.includes("cancelled")) {
      return APPLE_AUTH_ERRORS.USER_CANCELLED;
    }
    if (error.message.includes("authorization")) {
      return APPLE_AUTH_ERRORS.AUTHORIZATION_FAILED;
    }
    if (error.message.includes("credentials")) {
      return APPLE_AUTH_ERRORS.INVALID_CREDENTIALS;
    }
    if (error.message.includes("not available")) {
      return APPLE_AUTH_ERRORS.NOT_AVAILABLE;
    }
    return error.message;
  }

  // Handle error codes
  if (error.code) {
    switch (error.code) {
      case "ERR_CANCELLED":
        return APPLE_AUTH_ERRORS.USER_CANCELLED;
      case "ERR_INVALID_RESPONSE":
        return APPLE_AUTH_ERRORS.INVALID_RESPONSE;
      default:
        return `Apple authentication error: ${error.code}`;
    }
  }

  return APPLE_AUTH_ERRORS.UNKNOWN_ERROR;
};

/**
 * Clear all Apple Sign-In data
 */
export const clearAppleSignInData = async () => {
  try {
    await clearAppleCredentials();
    return true;
  } catch (error) {
    console.error("Error clearing Apple Sign-In data:", error);
    return false;
  }
};
