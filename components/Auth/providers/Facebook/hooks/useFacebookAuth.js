import { useEffect, useState } from "react";
import { Settings } from "react-native-fbsdk-next";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { FACEBOOK_AUTH_CONFIG } from "../config/constants";
import {
  isFacebookSignedIn,
  getCurrentFacebookAccessToken,
  getFacebookUserProfile,
  handleFacebookAuthError,
  clearFacebookSignInData,
  requestFacebookLogin,
} from "../utils/facebookAuthUtils";

export const useFacebookAuth = () => {
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    initializeFacebook();
    checkSignInStatus();
  }, []);

  const initializeFacebook = async () => {
    try {
      // Request tracking permissions for iOS
      const { status } = await requestTrackingPermissionsAsync();

      // Initialize Facebook SDK
      Settings.initializeSDK();

      if (status === "granted") {
        await Settings.setAdvertiserTrackingEnabled(true);
      }

      console.log("✅ Facebook SDK initialized successfully");
    } catch (error) {
      console.error("❌ Facebook SDK initialization failed:", error);
    }
  };

  const checkSignInStatus = async () => {
    try {
      const isSignedIn = await isFacebookSignedIn();
      if (isSignedIn) {
        const currentAccessToken = await getCurrentFacebookAccessToken();
        if (currentAccessToken) {
          setAccessToken(currentAccessToken.accessToken);

          // Get user profile
          try {
            const profile = await getFacebookUserProfile(
              currentAccessToken.accessToken
            );
            setUserInfo(profile);
          } catch (profileError) {
            console.error("Error getting Facebook profile:", profileError);
          }
        }
      }
    } catch (error) {
      console.error("Error checking Facebook sign-in status:", error);
    }
  };

  const signIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔑 Starting Facebook Sign-In process...");

      // Request Facebook login
      const loginResult = await requestFacebookLogin([
        "public_profile",
        "email",
      ]);

      if (loginResult.isCancelled) {
        throw new Error("User cancelled the Facebook login flow");
      }

      // Get access token
      const currentAccessToken = await getCurrentFacebookAccessToken();
      if (!currentAccessToken) {
        throw new Error("Failed to get Facebook access token");
      }

      setAccessToken(currentAccessToken.accessToken);

      // Get user profile data
      const profile = await getFacebookUserProfile(
        currentAccessToken.accessToken,
        [
          "id",
          "name",
          "email",
          "picture.type(large)",
          "first_name",
          "last_name",
        ]
      );

      setUserInfo(profile);
      console.log("✅ Facebook sign-in successful");

      return {
        accessToken: currentAccessToken.accessToken,
        profile,
      };
    } catch (error) {
      console.error("❌ Facebook Sign-In Error:", error);
      const errorMessage = handleFacebookAuthError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUserInfo(null);
      setAccessToken(null);
      const success = await clearFacebookSignInData();
      if (success) {
        console.log("✅ Facebook logged out successfully");
      }
    } catch (error) {
      console.error("❌ Facebook Logout Error:", error);
      setError(error.message || "Failed to logout from Facebook");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    userInfo,
    accessToken,
    isLoading,
    signIn,
    logout,
  };
};
