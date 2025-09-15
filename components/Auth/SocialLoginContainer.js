import React, { useContext, useState } from "react";
import { View, Alert, ActivityIndicator } from "react-native";
import { GoogleSignInButton } from "./providers/Google/components";
import { SafeFacebookSignInButton } from "./providers/Facebook/components";
import { AppleSignInButton } from "./providers/Apple/components";
import SocialLoginButton from "./SocialLoginButton";
import { AuthContext } from "../../store/auth-context";
import { UserContext } from "../../store/user-context";
import {
  signInWithGoogle,
  signInWithFacebook,
  completeFacebookSignIn,
  signInWithApple,
  completeAppleSignIn,
} from "../../util/socialAuth";
import { doc, getDoc } from "@react-native-firebase/firestore";
import { getFirebaseDB } from "../../util/firebaseConfig";
import * as AppleAuthentication from "expo-apple-authentication";

const SocialLoginContainer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  // Check Apple availability on component mount
  React.useEffect(() => {
    const checkAppleAvailability = async () => {
      try {
        const available = await AppleAuthentication.isAvailableAsync();
        setAppleAvailable(available);
      } catch (error) {
        console.error("Error checking Apple availability:", error);
        setAppleAvailable(false);
      }
    };
    checkAppleAvailability();
  }, []);

  const handleGooglePress = async () => {
    setIsLoading(true);
    try {
      console.log("🔑 Handling Google sign-in...");

      const result = await signInWithGoogle();

      // Authenticate with our app context
      authCtx.authenticate(result.token, result.userId, "google");

      // Set user info in context
      userCtx.setUser(result.userInfo);

      console.log("✅ Google authentication successful");
    } catch (error) {
      console.error("❌ Google sign-in failed:", error);

      let errorMessage = "Google sign-in failed. Please try again.";

      // Handle specific error messages
      if (error.message && error.message.includes("account already exists")) {
        errorMessage =
          "An account with this email already exists. Please use your original sign-in method.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message && error.message.includes("disabled")) {
        errorMessage =
          "This account has been disabled. Please contact support.";
      }

      Alert.alert("Sign-in Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookPress = async () => {
    setFacebookLoading(true);
    try {
      console.log("🔑 Handling Facebook sign-in (fallback method)...");

      const result = await signInWithFacebook();

      // Authenticate with our app context
      authCtx.authenticate(result.token, result.userId, "facebook");

      // // Set user info in context
      // console.log(
      //   "📸 Setting user info in context - Profile photo URL:",
      //   result.userInfo.profilePhotoUrl
      // );
      userCtx.setUser(result.userInfo);

      console.log("✅ Facebook authentication successful");
    } catch (error) {
      console.error("❌ Facebook sign-in failed:", error);

      let errorMessage = "Facebook sign-in failed. Please try again.";

      // Handle specific error messages
      if (error.message && error.message.includes("account already exists")) {
        errorMessage =
          "An account with this email already exists. Please use your original sign-in method.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message && error.message.includes("disabled")) {
        errorMessage =
          "This account has been disabled. Please contact support.";
      } else if (error.message && error.message.includes("cancelled")) {
        errorMessage = "Facebook sign-in was cancelled.";
      }

      Alert.alert("Sign-in Error", errorMessage);
    } finally {
      setFacebookLoading(false);
    }
  };

  const handleFacebookAuthComplete = async (accessToken) => {
    setFacebookLoading(true);
    try {
      console.log("🔑 Handling Facebook auth completion (official button)...");

      const result = await completeFacebookSignIn(accessToken);

      // Authenticate with our app context
      authCtx.authenticate(result.token, result.userId, "facebook");

      // // Set user info in context
      // console.log(
      //   "📸 Setting user info in context - Profile photo URL:",
      //   result.userInfo.profilePhotoUrl
      // );
      userCtx.setUser(result.userInfo);

      console.log("✅ Facebook authentication successful");
    } catch (error) {
      console.error("❌ Facebook auth completion failed:", error);

      let errorMessage = "Facebook sign-in failed. Please try again.";

      // Handle specific error messages
      if (error.message && error.message.includes("account already exists")) {
        errorMessage =
          "An account with this email already exists. Please use your original sign-in method.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message && error.message.includes("disabled")) {
        errorMessage =
          "This account has been disabled. Please contact support.";
      } else if (error.message && error.message.includes("cancelled")) {
        errorMessage = "Facebook sign-in was cancelled.";
      }

      Alert.alert("Sign-in Error", errorMessage);
    } finally {
      setFacebookLoading(false);
    }
  };

  const handleApplePress = async () => {
    if (!appleAvailable) {
      Alert.alert(
        "Not Available",
        "Apple Sign-In is not available on this device.",
        [{ text: "OK" }]
      );
      return;
    }

    setAppleLoading(true);
    try {
      console.log("🍎 Handling Apple sign-in...");

      const result = await signInWithApple();

      // Authenticate with our app context
      authCtx.authenticate(result.token, result.userId, "apple");

      // Set user info in context
      userCtx.setUser(result.userInfo);

      console.log("✅ Apple authentication successful");
    } catch (error) {
      console.error("❌ Apple sign-in failed:", error);

      let errorMessage = "Apple sign-in failed. Please try again.";

      // Handle specific error messages
      if (error.message && error.message.includes("account already exists")) {
        errorMessage =
          "An account with this email already exists. Please use your original sign-in method.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message && error.message.includes("disabled")) {
        errorMessage =
          "This account has been disabled. Please contact support.";
      } else if (error.message && error.message.includes("cancelled")) {
        errorMessage = "Apple sign-in was cancelled.";
      } else if (error.message && error.message.includes("not available")) {
        errorMessage = "Apple Sign-In is not available on this device.";
      }

      Alert.alert("Sign-in Error", errorMessage);
    } finally {
      setAppleLoading(false);
    }
  };

  const handleAppleAuthComplete = async (appleCredential) => {
    setAppleLoading(true);
    try {
      console.log("🍎 Handling Apple auth completion (official button)...");

      const result = await completeAppleSignIn(appleCredential);

      // Authenticate with our app context
      authCtx.authenticate(result.token, result.userId, "apple");

      // Set user info in context
      userCtx.setUser(result.userInfo);

      console.log("✅ Apple authentication successful");
    } catch (error) {
      console.error("❌ Apple auth completion failed:", error);

      let errorMessage = "Apple sign-in failed. Please try again.";

      // Handle specific error messages
      if (error.message && error.message.includes("account already exists")) {
        errorMessage =
          "An account with this email already exists. Please use your original sign-in method.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message && error.message.includes("disabled")) {
        errorMessage =
          "This account has been disabled. Please contact support.";
      } else if (error.message && error.message.includes("cancelled")) {
        errorMessage = "Apple sign-in was cancelled.";
      }

      Alert.alert("Sign-in Error", errorMessage);
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Google Sign-In Button */}
      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4285f4" />
        ) : (
          <GoogleSignInButton
            onPress={handleGooglePress}
            isLoading={isLoading}
          />
        )}
      </View>

      {/* Facebook Login Button */}
      <View style={styles.buttonContainer}>
        {facebookLoading ? (
          <ActivityIndicator size="large" color="#4267B2" />
        ) : (
          <SafeFacebookSignInButton
            onPress={handleFacebookPress}
            onFacebookAuthComplete={handleFacebookAuthComplete}
            isLoading={facebookLoading}
          />
        )}
      </View>

      {/* Apple Login Button - Only show if available */}
      {appleAvailable && (
        <View style={styles.buttonContainer}>
          {appleLoading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <AppleSignInButton
              onPress={handleApplePress}
              onAppleAuthComplete={handleAppleAuthComplete}
              isLoading={appleLoading}
              isAvailable={appleAvailable}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    width: "100%",
  },
  buttonContainer: {
    marginVertical: 4,
    alignItems: "center",
  },
};

export default SocialLoginContainer;
