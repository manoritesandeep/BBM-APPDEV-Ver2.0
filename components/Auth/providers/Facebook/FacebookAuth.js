// Refactored Facebook Auth component using modular components and custom hooks
import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";

import { useFacebookAuth } from "./hooks/useFacebookAuth";
import {
  SafeFacebookSignInButton,
  ErrorDisplay,
  AuthActions,
} from "./components";

function FacebookAuth() {
  const { error, userInfo, isLoading, signIn, logout } = useFacebookAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Facebook Authentication</Text>

      <ErrorDisplay error={error} />

      {!userInfo ? (
        <SafeFacebookSignInButton onPress={signIn} isLoading={isLoading} />
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

export default FacebookAuth;

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
