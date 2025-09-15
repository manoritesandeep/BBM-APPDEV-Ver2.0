import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useBillingEmails } from "./useBillingEmails";
import { AuthContext } from "../../../store/auth-context";
import { Button } from "react-native";

/**
 * Production-ready order confirmation email component
 * Handles both authenticated and guest users with real order data
 */
function SendOrderConfirmationEmail({
  orderData = null,
  onEmailSent = null,
  showDemo = false,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const authCtx = useContext(AuthContext);
  const { sendOrderConfirmationEmail, triggerOrderConfirmationEmail } =
    useBillingEmails();

  // // Demo order data for testing
  // const demoOrderData = {
  //   orderNum: "BBM-" + Date.now().toString().slice(-5),
  //   customerName: authCtx.isAuthenticated ? "Demo User" : "Guest User",
  //   customerEmail: "demo@buildbharatmart.com",
  //   guestEmail: showDemo ? "guest@example.com" : null,
  //   orderItems: [
  //     {
  //       name: "Professional Power Drill",
  //       quantity: 1,
  //       size: "Standard",
  //       price: "2,999",
  //     },
  //     {
  //       name: "Screwdriver Set (12 pieces)",
  //       quantity: 2,
  //       size: "Large",
  //       price: "899",
  //     },
  //     {
  //       name: "Safety Helmet",
  //       quantity: 1,
  //       size: "Medium",
  //       price: "599",
  //     },
  //   ],
  //   orderTotal: "4,497",
  //   deliveryAddress: "123 Construction Site, Building Nagar, Mumbai - 400001",
  //   estimatedDelivery: "3-5 business days",
  //   paymentMethod: "UPI",
  //   transactionId: "TXN" + Date.now(),
  // };

  const handleSendEmail = async () => {
    setIsLoading(true);
    setEmailStatus(null);

    try {
      // Use provided orderData or demo data
      const finalOrderData = orderData; // || demoOrderData;

      // Validate required data
      if (!finalOrderData.orderNum || !finalOrderData.customerName) {
        throw new Error("Order number and customer name are required");
      }

      // For production, use triggerOrderConfirmationEmail which handles auth logic
      const result = await (showDemo
        ? sendOrderConfirmationEmail(finalOrderData)
        : triggerOrderConfirmationEmail(finalOrderData));

      if (result.success) {
        setEmailStatus("success");
        Alert.alert(
          "Email Sent Successfully! ✅",
          `Order confirmation email has been sent for order ${finalOrderData.orderNum}`,
          [{ text: "OK" }]
        );

        // Callback for parent component
        if (onEmailSent) {
          onEmailSent(result, finalOrderData);
        }
      } else {
        setEmailStatus("error");
        Alert.alert(
          "Email Failed ❌",
          `Failed to send email: ${result.error}`,
          [{ text: "Retry", onPress: handleSendEmail }, { text: "Cancel" }]
        );
      }
    } catch (error) {
      setEmailStatus("error");
      console.error("Email component error:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while sending the email.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonTitle = () => {
    if (isLoading) return "Sending...";
    if (showDemo) return "Send Demo Email";
    if (orderData) return "Send Order Confirmation";
    return "Test Email System";
  };

  const getStatusText = () => {
    switch (emailStatus) {
      case "success":
        return "✅ Email sent successfully!";
      case "error":
        return "❌ Failed to send email";
      default:
        return "";
    }
  };

  const orderToDisplay = orderData; // || demoOrderData;

  return (
    <View style={styles.container}>
      {showDemo && (
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>📧 Email System Demo</Text>
          <Text style={styles.demoText}>
            Testing order confirmation email for order:{" "}
            {orderToDisplay.orderNum}
          </Text>
          <Text style={styles.demoText}>
            Customer: {orderToDisplay.customerName}
          </Text>
          <Text style={styles.demoText}>
            Items: {orderToDisplay.orderItems?.length || 0}
          </Text>
          <Text style={styles.demoText}>
            Total: ₹{orderToDisplay.orderTotal}
          </Text>
        </View>
      )}

      <Button
        title={getButtonTitle()}
        onPress={handleSendEmail}
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

      {authCtx.isAuthenticated ? (
        <Text style={styles.infoText}>
          📧 Email will be sent to your registered email address
        </Text>
      ) : (
        <Text style={styles.infoText}>
          📧 Email will be sent to the address provided during checkout
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  demoSection: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e40af",
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

export default SendOrderConfirmationEmail;
