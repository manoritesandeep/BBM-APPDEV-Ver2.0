// Refactored Apple Auth component using modular components and custom hooks
import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Alert } from "react-native";

import { useAppleAuth } from "./hooks/useAppleAuth";
import { AppleSignInButton, ErrorDisplay, AuthActions } from "./components";

function AppleAuth() {
  const {
    error,
    userInfo,
    isLoading,
    isAvailable,
    signIn,
    logout,
    refreshCredentials,
    checkCredentialState,
  } = useAppleAuth();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Apple sign-in failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Apple logout failed:", error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshCredentials();
      Alert.alert("Success", "Credentials refreshed successfully");
    } catch (error) {
      console.error("Refresh failed:", error);
      Alert.alert("Error", "Failed to refresh credentials");
    }
  };

  const handleCheckState = async () => {
    try {
      const state = await checkCredentialState();
      Alert.alert("Credential State", `Current state: ${state}`);
    } catch (error) {
      console.error("State check failed:", error);
      Alert.alert("Error", "Failed to check credential state");
    }
  };

  if (!isAvailable) {
    return (
      <View style={styles.container}>
        <Text style={styles.unavailableText}>
          Apple Sign-In is not available on this device
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apple Authentication</Text>

      <ErrorDisplay error={error} />

      <AuthActions
        userInfo={userInfo}
        onSignIn={handleSignIn}
        onLogout={handleLogout}
        onRefresh={handleRefresh}
        onCheckState={handleCheckState}
        isLoading={isLoading}
        isAvailable={isAvailable}
      />

      <StatusBar style="auto" />
    </View>
  );
}

export default AppleAuth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  unavailableText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});
