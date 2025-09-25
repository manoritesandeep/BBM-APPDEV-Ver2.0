import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import { Colors } from "../../constants/styles";
import { AuthContext } from "../../store/auth-context";
import { UserContext } from "../../store/user-context";
import {
  resendEmailVerification,
  checkEmailVerification,
  updateUserVerificationStatus,
  getEmailVerificationStatus,
} from "../../util/auth";

const EmailVerificationBanner = ({ navigation, onDismiss }) => {
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Don't render banner if user is already verified or is a phone auth user without email
  if (userCtx.user?.emailVerified) {
    return null;
  }

  // Don't show email verification banner for phone auth users who haven't added an email
  if (
    userCtx.user?.authProvider === "phone" &&
    (!userCtx.user?.email || userCtx.user?.email.trim() === "")
  ) {
    return null;
  }

  // Check rate limit status periodically
  useEffect(() => {
    checkRateLimitStatus();
    const interval = setInterval(checkRateLimitStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const checkRateLimitStatus = async () => {
    try {
      const status = await getEmailVerificationStatus();
      setCanResend(status.canSend);
      setTimeRemaining(status.timeRemaining);
    } catch (error) {
      console.error("Failed to check rate limit status:", error);
    }
  };

  const handleResendEmail = async () => {
    if (!canResend || isLoading) return;

    setIsLoading(true);
    try {
      await resendEmailVerification(authCtx.token, authCtx.refreshToken);
      Alert.alert(
        "Email Sent!",
        "Verification email has been sent to your inbox."
      );
      // Refresh status after successful send
      await checkRateLimitStatus();
    } catch (error) {
      console.error("Banner resend error:", error);
      Alert.alert(
        "Unable to Send Email",
        error.message || "Failed to send verification email."
      );
      // Refresh status even after error
      await checkRateLimitStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsLoading(true);
    try {
      const verificationStatus = await checkEmailVerification(authCtx.token);

      if (verificationStatus.emailVerified) {
        await updateUserVerificationStatus(authCtx.userId, true);
        userCtx.updateUser({ emailVerified: true });
        Alert.alert(
          "Email Verified!",
          "Your email has been successfully verified."
        );
        if (onDismiss) onDismiss();
      } else {
        Alert.alert(
          "Not Verified Yet",
          "Please check your email and click the verification link."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to check verification status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyNow = () => {
    // Check if already verified before navigating
    if (userCtx.user?.emailVerified) {
      Alert.alert(
        "Already Verified! ✅",
        "Your email is already verified. You have full access to all features!"
      );
      return;
    }

    // Navigate to UserScreen tab first, then to EmailVerification
    navigation.navigate("UserScreen", {
      screen: "EmailVerification",
      params: {
        userEmail: userCtx.user?.email,
      },
    });
  };

  // Don't show banner if user is already verified
  if (userCtx.user?.emailVerified) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>📧 Verify Your Email</Text>
          <Text style={styles.subtitle}>
            Verify to unlock checkout, orders, and payment features
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerifyNow}
            disabled={isLoading}
          >
            <Text style={styles.verifyButtonText}>Verify Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.resendButton,
              (!canResend || isLoading) && styles.disabledButton,
            ]}
            onPress={handleResendEmail}
            disabled={!canResend || isLoading}
          >
            <Text style={styles.resendButtonText}>
              {isLoading
                ? "Sending..."
                : !canResend
                ? `Wait ${
                    timeRemaining < 60
                      ? `${timeRemaining}s`
                      : `${Math.floor(timeRemaining / 60)}m`
                  }`
                : "Resend"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {onDismiss && (
        <Pressable style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.accent500,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    margin: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary800,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.primary600,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  verifyButton: {
    backgroundColor: Colors.primary800,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  verifyButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  resendButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary800,
  },
  resendButtonText: {
    color: Colors.primary800,
    fontSize: 12,
    fontWeight: "500",
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
  dismissText: {
    color: Colors.primary600,
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default EmailVerificationBanner;
