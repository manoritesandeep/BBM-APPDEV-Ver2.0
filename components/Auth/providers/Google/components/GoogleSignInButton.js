import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";

const { width } = Dimensions.get("window");

const GoogleSignInButton = ({
  onPress,
  isLoading = false,
  size = "standard",
}) => {
  // Determine button size based on screen width and prop
  const getButtonSize = () => {
    if (width < 350) {
      return GoogleSigninButton.Size.Icon;
    } else if (size === "wide" || width > 400) {
      return GoogleSigninButton.Size.Wide;
    } else {
      return GoogleSigninButton.Size.Standard;
    }
  };

  return (
    <View style={styles.container}>
      <GoogleSigninButton
        size={getButtonSize()}
        color={GoogleSigninButton.Color.Dark}
        onPress={onPress}
        disabled={isLoading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  button: {
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default GoogleSignInButton;
