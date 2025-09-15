import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ErrorDisplay = ({ error }) => {
  if (!error) {
    return null;
  }

  const getErrorMessage = (error) => {
    if (typeof error === "string") {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    return JSON.stringify(error);
  };

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Error:</Text>
      <Text style={styles.errorText}>{getErrorMessage(error)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f44336",
    marginBottom: 10,
    width: "100%",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: "#c62828",
  },
});

export default ErrorDisplay;
