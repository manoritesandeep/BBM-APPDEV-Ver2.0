import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    maxWidth: 350,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default ErrorDisplay;
