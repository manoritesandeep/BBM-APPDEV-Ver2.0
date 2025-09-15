import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong!</Text>
          <Text style={styles.message}>
            The app encountered an unexpected error. Please try restarting.
          </Text>
          {__DEV__ && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>
                {this.state.error && this.state.error.toString()}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  debugInfo: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: "100%",
  },
  debugTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 8,
  },
  debugText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "monospace",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ErrorBoundary;
