import { useEffect, useState } from "react";
import {
  isAppleSignInAvailable,
  getStoredAppleCredentials,
  requestAppleSignIn,
  refreshAppleCredentials,
  getAppleCredentialState,
  extractAppleUserInfo,
  handleAppleAuthError,
  clearAppleSignInData,
} from "../utils/appleAuthUtils";

export const useAppleAuth = () => {
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    initializeAppleAuth();
  }, []);

  const initializeAppleAuth = async () => {
    try {
      // Check if Apple Sign-In is available
      const available = await isAppleSignInAvailable();
      setIsAvailable(available);

      if (!available) {
        console.log("Apple Sign-In is not available on this device");
        return;
      }

      console.log("✅ Apple Sign-In is available");

      // Check for existing credentials
      const storedCredentials = await getStoredAppleCredentials();
      if (storedCredentials) {
        console.log("📱 Found stored Apple credentials");
        setCredentials(storedCredentials);

        try {
          // Extract user info from stored credentials
          const appleUserInfo = extractAppleUserInfo(storedCredentials);
          setUserInfo(appleUserInfo);

          // Check credential state
          const credentialState = await getAppleCredentialState(
            storedCredentials.user
          );
          console.log("Apple credential state:", credentialState);

          // If credentials are no longer valid, clear them
          if (credentialState !== "AUTHORIZED") {
            console.log("Apple credentials are no longer valid, clearing...");
            await clearAppleSignInData();
            setCredentials(null);
            setUserInfo(null);
          }
        } catch (error) {
          console.error("Error processing stored Apple credentials:", error);
          // Clear invalid stored credentials
          await clearAppleSignInData();
          setCredentials(null);
          setUserInfo(null);
        }
      }
    } catch (error) {
      console.error("Error initializing Apple auth:", error);
      setError(handleAppleAuthError(error));
    }
  };

  const signIn = async () => {
    if (!isAvailable) {
      setError("Apple Sign-In is not available on this device");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("🍎 Starting Apple Sign-In process...");

      // Request Apple sign-in
      const credential = await requestAppleSignIn();

      console.log("✅ Apple sign-in successful");
      console.log("Apple credential:", {
        email: credential.email,
        fullName: credential.fullName,
        user: credential.user,
        realUserStatus: credential.realUserStatus,
      });

      setCredentials(credential);

      // Extract and set user info
      const appleUserInfo = extractAppleUserInfo(credential);
      setUserInfo(appleUserInfo);

      return {
        credential,
        userInfo: appleUserInfo,
      };
    } catch (error) {
      console.error("❌ Apple Sign-In Error:", error);
      const errorMessage = handleAppleAuthError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCredentials = async () => {
    if (!credentials || !credentials.user) {
      throw new Error("No credentials available to refresh");
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 Refreshing Apple credentials...");

      const refreshedCredential = await refreshAppleCredentials(
        credentials.user
      );

      if (refreshedCredential) {
        setCredentials(refreshedCredential);
        const appleUserInfo = extractAppleUserInfo(refreshedCredential);
        setUserInfo(appleUserInfo);
        console.log("✅ Apple credentials refreshed successfully");
        return refreshedCredential;
      }

      return credentials; // Return existing if refresh didn't return new credentials
    } catch (error) {
      console.error("❌ Apple credential refresh error:", error);
      const errorMessage = handleAppleAuthError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCredentialState = async () => {
    if (!credentials || !credentials.user) {
      throw new Error("No credentials available to check");
    }

    try {
      const credentialState = await getAppleCredentialState(credentials.user);
      console.log("Apple credential state:", credentialState);
      return credentialState;
    } catch (error) {
      console.error("❌ Error checking Apple credential state:", error);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔓 Logging out from Apple...");

      // Clear stored credentials
      const success = await clearAppleSignInData();

      if (success) {
        setCredentials(null);
        setUserInfo(null);
        console.log("✅ Apple logout successful");
      }

      return success;
    } catch (error) {
      console.error("❌ Apple Logout Error:", error);
      const errorMessage = handleAppleAuthError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    userInfo,
    credentials,
    isLoading,
    isAvailable,
    signIn,
    logout,
    refreshCredentials,
    checkCredentialState,
  };
};
