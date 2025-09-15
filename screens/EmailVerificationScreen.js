import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaWrapper } from "../components/UI/SafeAreaWrapper";
import { Colors } from "../constants/styles";
import { AuthContext } from "../store/auth-context";
import { UserContext } from "../store/user-context";
import {
  checkEmailVerification,
  resendEmailVerification,
  updateUserVerificationStatus,
  getEmailVerificationStatus,
} from "../util/auth";
import LoadingOverlay from "../components/UI/authUI/LoadingOverlay";
import { useToast } from "../components/UI/Toast";

const EmailVerificationScreen = ({ route, navigation }) => {
  const { userEmail, token, userId, refreshToken } = route.params || {};
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);
  const { showToast, ToastComponent } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [rateLimitReason, setRateLimitReason] = useState(null);

  // Handle authentication for new signups
  useEffect(() => {
    if (token && userId && !authCtx.isAuthenticated) {
      // Authenticate user now that we're on the verification screen
      authCtx.authenticate(token, userId, "email", refreshToken);
    }
  }, [token, userId, refreshToken, authCtx.isAuthenticated]);

  // Check if user is already verified and redirect them
  useEffect(() => {
    if (userCtx.user?.emailVerified) {
      Alert.alert(
        "Already Verified! ✅",
        "Your email is already verified. Welcome to Build Bharat Mart!",
        [
          {
            text: "Continue",
            onPress: () => {
              // Navigate back and prevent returning to verification screen
              navigation.reset({
                index: 0,
                routes: [{ name: "UserMain" }],
              });
            },
          },
        ]
      );
      return;
    }
  }, [userCtx.user?.emailVerified, navigation]);

  // Check rate limit status on mount and periodically
  useEffect(() => {
    checkRateLimitStatus();
    const interval = setInterval(checkRateLimitStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkRateLimitStatus = async () => {
    try {
      const status = await getEmailVerificationStatus();
      setCanResend(status.canSend);
      setResendTimer(status.timeRemaining);
      setRateLimitReason(status.reason);
    } catch (error) {
      console.error("Failed to check rate limit status:", error);
    }
  };

  const handleResendEmail = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      // Use token from params (new signup) or auth context (existing user)
      const userToken = token || authCtx.token;
      const userRefreshToken = refreshToken || authCtx.refreshToken;

      await resendEmailVerification(userToken, userRefreshToken);
      showToast(
        "Verification email sent! Check your inbox and spam folder.",
        "success",
        4000
      );
      // Refresh rate limit status after successful send
      await checkRateLimitStatus();
    } catch (error) {
      console.error("Resend verification error:", error);
      showToast(
        error.message || "Failed to send verification email. Please try again.",
        "error",
        4000
      );
      // Refresh rate limit status even after error
      await checkRateLimitStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    try {
      // Use token from params (new signup) or auth context (existing user)
      const userToken = token || authCtx.token;
      const currentUserId = userId || authCtx.userId;

      const verificationStatus = await checkEmailVerification(userToken);

      if (verificationStatus.emailVerified) {
        // Update verification status in Firestore
        await updateUserVerificationStatus(currentUserId, true);

        // Update user context
        userCtx.updateUser({ emailVerified: true });

        Alert.alert(
          "Email Verified! ✅",
          "Your email has been successfully verified. Welcome to Build Bharat Mart!",
          [
            {
              text: "Continue Shopping",
              onPress: () => {
                // Reset navigation stack to prevent going back to verification
                navigation.reset({
                  index: 0,
                  routes: [{ name: "UserMain" }],
                });
              },
            },
          ]
        );
      } else {
        showToast(
          "Email not verified yet. Please check your email and click the verification link.",
          "warning",
          4000
        );
      }
    } catch (error) {
      showToast(
        "Failed to check verification status. Please try again.",
        "error",
        3000
      );
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleSkipForNow = () => {
    Alert.alert(
      "Limited Access Mode",
      "Without email verification, you can browse products but cannot:\n\n• Place orders\n• Save payment methods\n• Access order history\n• Use reward points\n\nThis helps us prevent fraud and protect all users.",
      [
        {
          text: "Verify Now",
          style: "default",
        },
        {
          text: "Browse Only",
          style: "destructive",
          onPress: () => {
            // Mark user as having limited access
            userCtx.updateUser({
              emailVerified: false,
              limitedAccess: true,
              skippedVerification: true,
            });
            // Reset navigation to prevent going back to verification
            navigation.reset({
              index: 0,
              routes: [{ name: "UserMain" }],
            });
          },
        },
      ]
    );
  };

  if (isLoading && !checkingVerification) {
    return <LoadingOverlay message="Sending verification email..." />;
  }

  return (
    <SafeAreaWrapper backgroundColor={Colors.primary100}>
      <ToastComponent />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Email Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.emailIcon}>📧</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Verify Your Email</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              We've sent a verification link to:
            </Text>
            <Text style={styles.email}>{userEmail}</Text>

            {/* Instructions */}
            <Text style={styles.instructions}>
              Please check your email and click the verification link to
              activate your account.
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {/* Check Verification Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  checkingVerification && styles.disabledButton,
                ]}
                onPress={handleCheckVerification}
                disabled={checkingVerification}
                activeOpacity={0.85}
                delayPressIn={0}
                delayPressOut={100}
              >
                {checkingVerification ? (
                  <Text style={styles.buttonTextPrimary}>🔄 Checking...</Text>
                ) : (
                  <Text style={styles.buttonTextPrimary}>
                    ✓ I've Verified My Email
                  </Text>
                )}
              </TouchableOpacity>

              {/* Resend Email Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.secondaryButton,
                  !canResend && styles.disabledButton,
                ]}
                onPress={handleResendEmail}
                disabled={!canResend || isLoading}
              >
                <Text style={styles.buttonTextSecondary}>
                  {!canResend
                    ? `${
                        rateLimitReason === "firebase_block"
                          ? "Firebase blocked - Wait"
                          : "Wait"
                      } ${
                        Math.floor(resendTimer / 60) > 0
                          ? `${Math.floor(resendTimer / 60)}m ${
                              resendTimer % 60
                            }s`
                          : `${resendTimer}s`
                      }`
                    : "Resend Verification Email"}
                </Text>
              </TouchableOpacity>

              {/* Skip Button */}
              <TouchableOpacity
                style={[styles.button, styles.textButton]}
                onPress={handleSkipForNow}
              >
                <Text style={styles.buttonTextTertiary}>Skip for Now</Text>
              </TouchableOpacity>
            </View>

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                Didn't receive the email? Check your spam folder or try
                resending.
              </Text>

              {/* Troubleshooting Tips */}
              <View style={styles.tipContainer}>
                <Text style={styles.tipTitle}>📧 Email Troubleshooting:</Text>
                <Text style={styles.tipText}>
                  • Check your spam/junk folder
                </Text>
                <Text style={styles.tipText}>
                  • Look for emails from Firebase/noreply
                </Text>
                <Text style={styles.tipText}>
                  • Add our domain to your safe senders
                </Text>
                <Text style={styles.tipText}>
                  • Wait 2-3 minutes for delivery
                </Text>
              </View>

              {!canResend && rateLimitReason === "firebase_block" && (
                <Text style={styles.warningText}>
                  ⚠️ We've sent multiple verification emails. To prevent spam,
                  there's a temporary sending limit. Please check your email
                  thoroughly and wait before requesting another.
                </Text>
              )}
              {!canResend && rateLimitReason === "approaching_limit" && (
                <Text style={styles.warningText}>
                  ⚠️ You're approaching the email sending limit. Please check
                  your inbox and spam folder before requesting another email.
                </Text>
              )}
              {!canResend && rateLimitReason === "app_rate_limit" && (
                <Text style={styles.infoText}>
                  ⏱️ Please wait a moment before requesting another verification
                  email.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 6,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
    minHeight: 600,
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 15,
  },
  emailIcon: {
    fontSize: 80,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary800,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary600,
    textAlign: "center",
    marginBottom: 5,
  },
  email: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary800,
    textAlign: "center",
    marginBottom: 12,
  },
  instructions: {
    fontSize: 16,
    color: Colors.primary600,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    minHeight: 50,
    justifyContent: "center",
  },
  primaryButton: {
    // backgroundColor: Colors.primary800,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.error600,
  },
  textButton: {
    backgroundColor: "transparent",
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: Colors.gray400,
  },
  buttonTextPrimary: {
    color: Colors.accent700,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonTextSecondary: {
    color: Colors.primary800,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextTertiary: {
    color: Colors.primary600,
    fontSize: 16,
    textDecorationLine: "underline",
  },
  helpContainer: {
    marginTop: 4,
    paddingHorizontal: 20,
  },
  helpText: {
    fontSize: 14,
    color: Colors.error500,
    textAlign: "center",
    lineHeight: 20,
  },
  tipContainer: {
    backgroundColor: Colors.primary50,
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary700,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: Colors.primary600,
    lineHeight: 18,
    marginBottom: 2,
  },
  warningText: {
    fontSize: 13,
    color: Colors.error500,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
    fontStyle: "italic",
    backgroundColor: Colors.error50,
    padding: 10,
    borderRadius: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.primary600,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 10,
    fontStyle: "italic",
    backgroundColor: Colors.primary50,
    padding: 10,
    borderRadius: 6,
  },
});

export default EmailVerificationScreen;
