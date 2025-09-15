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
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    textAlign: "center",
  },
});

export default ErrorDisplay;
