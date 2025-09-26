import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../../../constants/styles";
import { usePhoneAuth } from "../hooks/usePhoneAuth";
import { useToast } from "../../../../UI/Toast";
import LoadingOverlay from "../../../../UI/authUI/LoadingOverlay";

const PhoneAuthScreen = ({
  isSignUp = false,
  onSuccess = () => {},
  onBack = () => {},
  initialData = {},
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' or 'verification'
  const [countdown, setCountdown] = useState(0);
  const phoneInputRef = useRef(null);
  const codeInputRef = useRef(null);

  const {
    isLoading,
    verificationInProgress,
    sendVerificationCode,
    verifyCode,
    resendVerificationCode,
    resetPhoneAuth,
    validatePhoneNumber,
    formatPhoneNumber,
  } = usePhoneAuth();

  const { showToast } = useToast();

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-format phone number as user types
  const handlePhoneNumberChange = (text) => {
    // Remove all non-digit characters except +
    let cleaned = text.replace(/[^\d+]/g, "");

    // Ensure it starts with +
    if (cleaned && !cleaned.startsWith("+")) {
      cleaned = "+" + cleaned;
    }

    setPhoneNumber(cleaned);
  };

  // Send OTP with better UX messaging
  const handleSendOTP = async () => {
    try {
      // Show initial loading message
      showToast("Sending verification code...", "info", 2000);

      const result = await sendVerificationCode(phoneNumber);
      showToast(result.message, "success", 3000);
      setStep("verification");
      setCountdown(60); // 60 seconds countdown
      // Focus on verification code input
      setTimeout(() => codeInputRef.current?.focus(), 500);
    } catch (error) {
      showToast(error.message, "error", 4000);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    try {
      const result = await verifyCode(verificationCode, isSignUp, initialData);
      showToast(result.message, "success", 3000);
      onSuccess(result);
    } catch (error) {
      showToast(error.message, "error", 4000);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      const result = await resendVerificationCode(phoneNumber);
      showToast(result.message, "success", 3000);
      setCountdown(60);
    } catch (error) {
      showToast(error.message, "error", 4000);
    }
  };

  // Go back to phone number entry
  const handleBackToPhone = () => {
    setStep("phone");
    setVerificationCode("");
    resetPhoneAuth();
  };

  // Handle back navigation
  const handleBack = () => {
    if (step === "verification") {
      handleBackToPhone();
    } else {
      onBack();
    }
  };

  if (isLoading) {
    return (
      <LoadingOverlay
        message={
          step === "phone"
            ? "Sending verification code..."
            : "Verifying your phone number..."
        }
        overlay={true}
        backgroundColor="rgba(255, 255, 255, 0.95)"
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.accent700} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {step === "phone" ? "Phone Verification" : "Enter OTP"}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {step === "phone" ? (
            <>
              {/* Phone Number Entry */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="phone-portrait"
                  size={50}
                  color={Colors.primary500}
                />
              </View>

              <Text style={styles.subtitle}>
                {isSignUp
                  ? "Enter your phone number to create your account"
                  : "Enter your phone number to sign in"}
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.phoneInputWrapper}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={Colors.accent500}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={phoneInputRef}
                    placeholder="Enter phone number (+1234567890)"
                    value={phoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    style={styles.phoneInput}
                    keyboardType="phone-pad"
                    autoCompleteType="tel"
                    textContentType="telephoneNumber"
                    editable={!isLoading}
                    autoFocus={true}
                    placeholderTextColor={Colors.accent400}
                  />
                </View>

                {phoneNumber && !validatePhoneNumber(phoneNumber) && (
                  <Text style={styles.errorText}>
                    Please enter a valid phone number with country code
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!validatePhoneNumber(phoneNumber) || isLoading) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleSendOTP}
                disabled={!validatePhoneNumber(phoneNumber) || isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? "Sending..." : "Send OTP"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.infoText}>
                We'll send you a 6-digit verification code via SMS
              </Text>

              <Text style={styles.securityInfo}>
                🔒 A security verification may appear briefly to prevent
                automated abuse
              </Text>
            </>
          ) : (
            <>
              {/* OTP Verification */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={50}
                  color={Colors.primary500}
                />
              </View>

              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to
              </Text>
              <Text style={styles.phoneDisplay}>{phoneNumber}</Text>

              <View style={styles.inputContainer}>
                <View style={styles.codeInputWrapper}>
                  <Ionicons
                    name="keypad-outline"
                    size={20}
                    color={Colors.accent500}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={codeInputRef}
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    style={styles.codeInput}
                    keyboardType="numeric"
                    maxLength={6}
                    autoCompleteType="sms-otp"
                    textContentType="oneTimeCode"
                    editable={!isLoading}
                    placeholderTextColor={Colors.accent400}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (verificationCode.length < 6 || isLoading) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleVerifyOTP}
                disabled={verificationCode.length < 6 || isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Text>
              </TouchableOpacity>

              {/* Resend Code */}
              <View style={styles.resendContainer}>
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>
                    Resend code in {countdown}s
                  </Text>
                ) : (
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendOTP}
                    disabled={isLoading}
                  >
                    <Text style={styles.resendButtonText}>Resend Code</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Change Number */}
              <TouchableOpacity
                style={styles.changeNumberButton}
                onPress={handleBackToPhone}
                disabled={isLoading}
              >
                <Text style={styles.changeNumberText}>
                  Use different number
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.accent700,
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: Colors.primary200,
    borderRadius: 50,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
    color: Colors.accent600,
    lineHeight: 22,
  },
  phoneDisplay: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.accent700,
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary300,
    borderRadius: 12,
    backgroundColor: Colors.primary50,
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  codeInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary300,
    borderRadius: 12,
    backgroundColor: Colors.primary50,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors.accent700,
  },
  codeInput: {
    flex: 1,
    padding: 16,
    fontSize: 18,
    letterSpacing: 2,
    textAlign: "center",
    color: Colors.accent700,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error500,
    marginTop: 4,
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: Colors.primary500,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    elevation: 2,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: Colors.accent300,
    elevation: 0,
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 12,
    textAlign: "center",
    color: Colors.accent500,
    lineHeight: 16,
  },
  resendContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  countdownText: {
    fontSize: 14,
    color: Colors.accent500,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 14,
    color: Colors.primary500,
    fontWeight: "600",
  },
  changeNumberButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  changeNumberText: {
    fontSize: 14,
    color: Colors.accent500,
    textAlign: "center",
  },
  securityInfo: {
    fontSize: 12,
    color: Colors.accent400,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
    paddingHorizontal: 20,
  },
});

export default PhoneAuthScreen;
