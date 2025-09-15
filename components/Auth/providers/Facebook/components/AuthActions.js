import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import SafeFacebookSignInButton from "./SafeFacebookSignInButton";

const AuthActions = ({ userInfo, onSignIn, onLogout, isLoading }) => {
  if (!userInfo) {
    return (
      <SafeFacebookSignInButton onPress={onSignIn} isLoading={isLoading} />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {userInfo.name}!</Text>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogout}
        disabled={isLoading}
      >
        <Text style={styles.logoutButtonText}>
          {isLoading ? "Logging out..." : "Logout"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 16,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AuthActions;
