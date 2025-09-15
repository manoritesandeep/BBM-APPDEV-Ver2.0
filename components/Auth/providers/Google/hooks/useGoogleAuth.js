import { useEffect, useState } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GOOGLE_AUTH_CONFIG } from "../config/constants";
import {
  handleGoogleSignInError,
  clearGoogleSignInData,
  isSignedIn,
} from "../utils/googleAuthUtils";

export const useGoogleAuth = () => {
  const [error, setError] = useState();
  const [userInfo, setUserInfo] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure(GOOGLE_AUTH_CONFIG);

    // Check if user is already signed in
    const checkSignInStatus = async () => {
      try {
        const signedIn = await isSignedIn();
        if (signedIn) {
          const currentUser = await GoogleSignin.getCurrentUser();
          setUserInfo(currentUser);
        }
      } catch (error) {
        console.error("Error checking sign-in status:", error);
      }
    };

    checkSignInStatus();
  }, []);

  const signIn = async () => {
    console.log("Pressed sign in button.");
    setIsLoading(true);
    setError(null);

    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      setUserInfo(user);
      console.log("Signed In successfully");
    } catch (e) {
      console.error("Google Sign In Error:", e);
      const errorMessage = handleGoogleSignInError(e);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUserInfo(undefined);
      const success = await clearGoogleSignInData();
      if (success) {
        console.log("Logged out successfully");
      }
    } catch (e) {
      console.error("Logout Error:", e);
      setError(e.message || "Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    userInfo,
    isLoading,
    signIn,
    logout,
  };
};
