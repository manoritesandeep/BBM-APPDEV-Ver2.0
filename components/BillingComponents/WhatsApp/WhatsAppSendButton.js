import React from "react";
import { Button, Alert, View, Text, StyleSheet } from "react-native";
import whatsAppService from "./WhatsApp";

function WhatsAppSendButton() {
  const sendTestOrderConfirmation = async () => {
    const testOrderDetails = {
      customerName: "Naresh Kumar",
      orderNumber: "BBM-1234567890-123",
      total: "1,250",
      trackingLink: "https://buildbharatmart.com/track/BBM-1234567890-123",
      address: "123 Main Street, New Delhi, 110001",
      phone: "919582398520", // This is our test number
      items: [
        { name: "Hammer", quantity: 2 },
        { name: "Screwdriver Set", quantity: 1 },
        { name: "Paint Brush", quantity: 3 },
      ],
    };

    try {
      console.log("🧪 Testing WhatsApp order confirmation...");

      // Try WhatsApp service
      const result = await whatsAppService.sendOrderConfirmation(
        "919582398520", // Test with your verified number
        testOrderDetails
      );

      if (result.success) {
        Alert.alert(
          "Success!",
          `WhatsApp message sent via ${result.method}!\n\n${
            result.message || "Check WhatsApp for the message."
          }`
        );
      } else {
        Alert.alert(
          "Info",
          `WhatsApp test completed with method: ${result.method}\n\n${
            result.message || "Check console for details."
          }`
        );
      }
    } catch (error) {
      console.error("WhatsApp service error:", error);
      Alert.alert("Error", "Failed to send WhatsApp message");
    }
  };

  const sendTestTextMessage = async () => {
    const message =
      "🎉 Hello from Build Bharat Mart! This is a test message to verify WhatsApp integration is working properly.";

    try {
      console.log("🧪 Testing WhatsApp text message...");
      const result = await whatsAppService.sendTextMessage(
        "919582398520",
        message
      );

      if (result.success) {
        Alert.alert("Success", "WhatsApp text message sent successfully!");
      } else {
        // Try fallback method - NOTE: Manual methods are now commented out for better UX
        Alert.alert(
          "Info",
          "WhatsApp API failed. Manual fallback methods are disabled for better user experience."
        );

        /* COMMENTED OUT - NON USER FRIENDLY FALLBACK
        whatsAppService.openWhatsAppWithMessage("919582398520", message);
        Alert.alert(
          "Fallback",
          "WhatsApp API failed, opened WhatsApp app with pre-filled message"
        );
        */
      }
    } catch (error) {
      console.error("WhatsApp text message error:", error);
      // Final fallback - NOTE: Manual methods are now commented out for better UX
      Alert.alert(
        "Error",
        "WhatsApp messaging failed. Manual fallback methods are disabled for better user experience."
      );

      /* COMMENTED OUT - NON USER FRIENDLY FALLBACK
      whatsAppService.openWhatsAppWithMessage("919582398520", message);
      Alert.alert("Fallback", "Using WhatsApp deep link method");
      */
    }
  };

  const testDeepLinkOnly = () => {
    // NOTE: Manual deep link methods are now commented out for better UX
    Alert.alert(
      "Deep Link Test Disabled",
      "Manual WhatsApp deep link methods have been disabled for better user experience. The app now focuses on automated API-based messaging only."
    );

    /* COMMENTED OUT - NON USER FRIENDLY MANUAL METHOD
    const message =
      "🧪 Test message from Build Bharat Mart app! This message was sent using the WhatsApp deep link method.";

    try {
      whatsAppService.openWhatsAppWithMessage("919582398520", message);
      Alert.alert(
        "Deep Link Test",
        "WhatsApp should open with a pre-filled message. You'll need to tap the send button manually."
      );
    } catch (error) {
      Alert.alert("Error", "Failed to open WhatsApp");
    }
    */
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 WhatsApp Integration Testing</Text>
      <Text style={styles.subtitle}>
        Test the WhatsApp order confirmation system
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="🎉 Test Order Confirmation"
          onPress={sendTestOrderConfirmation}
          color="#25D366"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="💬 Test Text Message"
          onPress={sendTestTextMessage}
          color="#128C7E"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="� Deep Link Test (Disabled)"
          onPress={testDeepLinkOnly}
          color="#999999"
        />
      </View>

      <Text style={styles.note}>
        Note: Business API messages work only with verified numbers. Manual
        fallback methods have been disabled for better user experience.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: "#25D366",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#075E54",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#128C7E",
    textAlign: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    marginVertical: 6,
  },
  note: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
});

export default WhatsAppSendButton;
