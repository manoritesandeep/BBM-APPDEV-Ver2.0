import React from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";

const { width: screenWidth } = Dimensions.get("window");

const AppleSignInButton = ({
  onPress,
  isLoading = false,
  style,
  buttonType = AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN,
  buttonStyle = AppleAuthentication.AppleAuthenticationButtonStyle.BLACK,
  cornerRadius = 8,
  isAvailable = true,
}) => {
  // Calculate responsive button width
  const getButtonWidth = () => {
    if (screenWidth <= 320) return 250;
    if (screenWidth <= 375) return 280;
    return 305;
  };

  const buttonWidth = getButtonWidth();

  // Don't render if Apple Sign-In is not available
  if (!isAvailable) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={[styles.buttonContainer, { width: buttonWidth }, style]}>
        <View style={[styles.loadingButton, { width: buttonWidth }]}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.buttonContainer, { width: buttonWidth }, style]}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={buttonType}
        buttonStyle={buttonStyle}
        cornerRadius={cornerRadius}
        style={[styles.appleButton, { width: buttonWidth }]}
        onPress={onPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    marginVertical: 6,
  },
  appleButton: {
    height: 44,
  },
  loadingButton: {
    height: 50,
    backgroundColor: "#000",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.7,
  },
});

export default AppleSignInButton;
