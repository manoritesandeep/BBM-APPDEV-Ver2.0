import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaWrapper } from "../../../UI/SafeAreaWrapper";
import { Colors } from "../../../../constants/styles";
import Input from "../../Input";
import Button from "../../../UI/authUI/Button";
import FlatButton from "../../../UI/authUI/FlatButton";
import LoadingOverlay from "../../../UI/authUI/LoadingOverlay";
import { sendPasswordResetEmail } from "../../../../util/auth";
import { useToast } from "../../../UI/Toast";

function EmailPasswordReset({ navigation }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { showToast, ToastComponent } = useToast();

  async function handlePasswordReset() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showToast("Please enter your email address", "error", 3000);
      return;
    }

    if (!trimmedEmail.includes("@")) {
      showToast("Please enter a valid email address", "error", 3000);
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(trimmedEmail);
      setEmailSent(true);
      showToast(
        "Password reset email sent! Check your inbox.",
        "success",
        4000
      );

      Alert.alert(
        "Email Sent!",
        `A password reset link has been sent to ${trimmedEmail}. Please check your email inbox and spam folder.`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Password reset error:", error);
      showToast(error.message, "error", 4000);

      Alert.alert("Reset Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleBackToLogin() {
    navigation.goBack();
  }

  if (isLoading) {
    return (
      <LoadingOverlay
        message="Sending password reset email..."
        overlay={true}
        backgroundColor="rgba(255, 255, 255, 0.95)"
      />
    );
  }

  return (
    <SafeAreaWrapper
      edges={["left", "right"]}
      backgroundColor={Colors.primary100}
    >
      <ToastComponent />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={60}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your
                password.
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <Input
                label="Email Address"
                onUpdateValue={(value) => setEmail(value)}
                value={email}
                keyboardType="email-address"
                isInvalid={false}
                placeholder="Enter your email address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.buttonContainer}>
                <Button onPress={handlePasswordReset} disabled={isLoading}>
                  Send Reset Email
                </Button>

                <FlatButton onPress={handleBackToLogin}>
                  Back to Sign In
                </FlatButton>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsSection}>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionEmoji}>📧</Text>
                <Text style={styles.instructionText}>
                  Check your email inbox for the password reset link
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.instructionEmoji}>📁</Text>
                <Text style={styles.instructionText}>
                  Don't forget to check your spam folder
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.instructionEmoji}>🔗</Text>
                <Text style={styles.instructionText}>
                  Click the link in the email to create a new password
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

export default EmailPasswordReset;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    maxWidth: 380,
    alignSelf: "center",
    width: "100%",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.accent700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.accent600,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  formSection: {
    marginBottom: 32,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  instructionsSection: {
    backgroundColor: Colors.primary200,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary300,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  instructionEmoji: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.accent600,
    lineHeight: 18,
  },
});
