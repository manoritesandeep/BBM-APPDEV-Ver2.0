import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AppleSignInButton from "./AppleSignInButton";

const AuthActions = ({
  userInfo,
  onSignIn,
  onLogout,
  onRefresh,
  onCheckState,
  isLoading,
  isAvailable,
}) => {
  if (!userInfo) {
    return (
      <AppleSignInButton
        onPress={onSignIn}
        isLoading={isLoading}
        isAvailable={isAvailable}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Welcome, {userInfo.name || userInfo.email}!
      </Text>

      <View style={styles.userInfo}>
        <Text style={styles.infoText}>
          Email: {userInfo.email || "Not provided"}
        </Text>
        <Text style={styles.infoText}>Provider: 🍎 Apple</Text>
        {userInfo.isTokenExpired && (
          <Text style={styles.warningText}>Token expired</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onRefresh}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>
            {isLoading ? "Refreshing..." : "Refresh Credentials"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onCheckState}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>
            {isLoading ? "Checking..." : "Check State"}
          </Text>
        </TouchableOpacity>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  userInfo: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 250,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: "#ff9800",
    fontWeight: "600",
    marginTop: 4,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 4,
    minWidth: 200,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    minWidth: 200,
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
    textAlign: "center",
  },
});

export default AuthActions;
