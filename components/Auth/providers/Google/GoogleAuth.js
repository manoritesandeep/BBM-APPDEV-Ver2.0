// Refactored Google Auth component using modular components and custom hooks
import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";

import { useGoogleAuth } from "./hooks/useGoogleAuth";
import { GoogleSignInButton, ErrorDisplay, AuthActions } from "./components";

export default function GoogleAuth() {
  const { error, userInfo, isLoading, signIn, logout } = useGoogleAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Authentication</Text>

      <ErrorDisplay error={error} />

      {!userInfo ? (
        <GoogleSignInButton onPress={signIn} isLoading={isLoading} />
      ) : (
        <AuthActions
          userInfo={userInfo}
          onSignIn={signIn}
          onLogout={logout}
          isLoading={isLoading}
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

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
});
