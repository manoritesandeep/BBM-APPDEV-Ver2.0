import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Button } from "react-native";
import { useUserEmails } from "./useUserEmails";
import { AuthContext } from "../../../store/auth-context";

/**
 * Welcome email component for new user registrations
 * Automatically triggers on signup or can be used manually
 */
function SendWelcomeEmail({
  userEmail = null,
  userName = null,
  autoSend = false,
  onEmailSent = null,
  showDemo = false,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const authCtx = useContext(AuthContext);
  const { sendWelcomeEmail } = useUserEmails();

  // Demo user data
  const demoUserData = {
    email: "demo@buildbharatmart.com",
    name: "Demo User",
  };

  React.useEffect(() => {
    if (autoSend && userEmail && userName) {
      handleSendWelcomeEmail();
    }
  }, [autoSend, userEmail, userName]);

  const handleSendWelcomeEmail = async () => {
    setIsLoading(true);
    setEmailStatus(null);

    try {
      const targetEmail = userEmail || demoUserData.email;
      const targetName = userName || demoUserData.name;

      if (!targetEmail || !targetName) {
        throw new Error("User email and name are required");
      }

      const result = await sendWelcomeEmail(targetEmail, targetName);

      if (result.success) {
        setEmailStatus("success");
        Alert.alert(
          "Welcome Email Sent! 🎉",
          `Welcome email has been sent to ${targetName} at ${targetEmail}`,
          [{ text: "OK" }]
        );

        if (onEmailSent) {
          onEmailSent(result, { email: targetEmail, name: targetName });
        }
      } else {
        setEmailStatus("error");
        Alert.alert(
          "Email Failed ❌",
          `Failed to send welcome email: ${result.error}`,
          [
            { text: "Retry", onPress: handleSendWelcomeEmail },
            { text: "Cancel" },
          ]
        );
      }
    } catch (error) {
      setEmailStatus("error");
      console.error("Welcome email component error:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while sending the welcome email.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonTitle = () => {
    if (isLoading) return "Sending...";
    if (showDemo) return "Send Demo Welcome Email";
    return "Send Welcome Email";
  };

  const getStatusText = () => {
    switch (emailStatus) {
      case "success":
        return "✅ Welcome email sent successfully!";
      case "error":
        return "❌ Failed to send welcome email";
      default:
        return "";
    }
  };

  const displayEmail = userEmail || demoUserData.email;
  const displayName = userName || demoUserData.name;

  // Don't render anything if autoSend is true (invisible trigger)
  if (autoSend && !showDemo) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showDemo && (
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>👋 Welcome Email Demo</Text>
          <Text style={styles.demoText}>
            Testing welcome email for: {displayName}
          </Text>
          <Text style={styles.demoText}>Email: {displayEmail}</Text>
        </View>
      )}

      <Button
        title={getButtonTitle()}
        onPress={handleSendWelcomeEmail}
        disabled={isLoading}
      />

      {emailStatus && (
        <Text
          style={[
            styles.statusText,
            emailStatus === "success" ? styles.successText : styles.errorText,
          ]}
        >
          {getStatusText()}
        </Text>
      )}

      <Text style={styles.infoText}>
        🎉 Welcome emails help onboard new users to Build Bharat Mart
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  demoSection: {
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  successText: {
    color: "#10b981",
  },
  errorText: {
    color: "#ef4444",
  },
  infoText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 280,
  },
});

export default SendWelcomeEmail;
