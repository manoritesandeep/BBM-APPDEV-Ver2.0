import React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { LoginButton, AccessToken } from "react-native-fbsdk-next";

const { width: screenWidth } = Dimensions.get("window");

const SafeFacebookSignInButton = ({
  onPress,
  onFacebookAuthComplete,
  isLoading = false,
  style,
}) => {
  // Determine button size based on screen width
  const getButtonWidth = () => {
    if (screenWidth < 350) return 235; // Small screens
    if (screenWidth < 400) return 265; // Medium screens
    return 305; // Large screens
  };

  const buttonWidth = getButtonWidth() / 1;

  // Custom button handler for fallback (iOS compatibility)
  const handleCustomPress = async () => {
    console.log(
      "🔘 Facebook custom button pressed, delegating to external handler"
    );
    onPress && onPress();
  };

  // Handle successful authentication from LoginButton
  const handleLoginButtonSuccess = async (result) => {
    try {
      console.log("🔘 Official Facebook LoginButton authentication completed");

      // Get the current access token
      const accessToken = await AccessToken.getCurrentAccessToken();
      if (!accessToken) {
        throw new Error(
          "Failed to get Facebook access token after LoginButton success"
        );
      }

      // If we have a specific Facebook auth complete handler, use it
      if (onFacebookAuthComplete) {
        console.log("📞 Calling onFacebookAuthComplete with access token");
        await onFacebookAuthComplete(accessToken.accessToken);
      } else if (onPress) {
        // Fallback to the general onPress handler
        console.log("📞 Falling back to onPress handler");
        onPress();
      }
    } catch (error) {
      console.error("❌ Error handling LoginButton success:", error);
      // Still try the fallback
      onPress && onPress();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.buttonContainer, { width: buttonWidth }, style]}>
        <View style={[styles.loadingButton, { width: buttonWidth }]}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      </View>
    );
  }

  // Use official Facebook LoginButton for Android and newer iOS versions
  // Fallback to custom button for older iOS versions if there are compatibility issues
  if (Platform.OS === "android" || Platform.Version >= 14) {
    return (
      <View style={[styles.buttonContainer, { width: buttonWidth }, style]}>
        <LoginButton
          style={[styles.facebookButton, { width: buttonWidth }]}
          onLoginFinished={(error, result) => {
            if (error) {
              console.error("Facebook LoginButton error:", error);
              // Still try the fallback handler
              onPress && onPress();
            } else if (result && !result.isCancelled) {
              console.log("Facebook LoginButton success:", result);
              // Handle the successful authentication
              handleLoginButtonSuccess(result);
            }
          }}
          onLogoutFinished={() => {
            console.log("Facebook logged out via LoginButton");
          }}
          permissions={["public_profile", "email"]}
          loginBehavior="native_with_fallback"
          tooltipBehavior="automatic"
        />
      </View>
    );
  }

  // Fallback to custom button for older iOS versions
  return (
    <View style={[styles.buttonContainer, { width: buttonWidth }, style]}>
      <TouchableOpacity
        style={[styles.customFacebookButton, { width: buttonWidth }]}
        onPress={handleCustomPress}
      >
        <Text style={styles.buttonText}>Continue with Facebook</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    marginVertical: 3,
  },
  facebookButton: {
    height: 38,
    borderRadius: 8,
  },
  customFacebookButton: {
    height: 38,
    backgroundColor: "#1877f2",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingButton: {
    height: 50,
    backgroundColor: "#1877f2",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.7,
  },
});

export default SafeFacebookSignInButton;
