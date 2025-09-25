import { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";

import AuthContent from "../components/Auth/AuthContent";
import PhoneAuth from "../components/Auth/providers/Phone/PhoneAuth";
import { Colors } from "../constants/styles";
import { AuthContext } from "../store/auth-context";
import { UserContext } from "../store/user-context";
import { SafeAreaWrapper } from "../components/UI/SafeAreaWrapper";
import LoadingOverlay from "../components/UI/authUI/LoadingOverlay";
import { useEmailAuth } from "../components/Auth/providers/EmailAuth/EmailAuthProvider";
import { useToast } from "../components/UI/Toast";

function UnifiedAuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const { handleEmailAuth, isAuthenticating } = useEmailAuth();
  const { ToastComponent } = useToast();

  async function authHandler(credentials) {
    await handleEmailAuth(credentials, isLogin, navigation);
  }

  function switchAuthModeHandler() {
    setIsLogin((prev) => !prev);
  }

  function handleForgotPassword() {
    navigation.navigate("EmailPasswordReset");
  }

  function handlePhoneAuth() {
    setShowPhoneAuth(true);
  }

  function handlePhoneAuthSuccess(result) {
    // Phone authentication was successful
    // Navigation will be handled automatically by the auth context
    setShowPhoneAuth(false);
  }

  function handleBackFromPhoneAuth() {
    setShowPhoneAuth(false);
  }

  if (isAuthenticating) {
    return (
      <LoadingOverlay
        message={
          isLogin
            ? "Signing you in..."
            : "Creating your account and setting up email verification..."
        }
        overlay={true}
        backgroundColor="rgba(255, 255, 255, 0.95)"
      />
    );
  }

  // Show phone authentication screen
  if (showPhoneAuth) {
    return (
      <SafeAreaWrapper
        edges={["left", "right"]}
        backgroundColor={Colors.primary100}
      >
        <ToastComponent />
        <PhoneAuth
          isSignUp={!isLogin}
          onSuccess={handlePhoneAuthSuccess}
          onBack={handleBackFromPhoneAuth}
        />
      </SafeAreaWrapper>
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
            {/* Logo and Title Section */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/splash.png")}
                  style={styles.imageLogo}
                />
              </View>
              <Text style={styles.title}>Welcome to Build Bharat Mart!</Text>

              <Text style={styles.subtitle}>
                {isLogin
                  ? "Welcome back! Please sign in to your account."
                  : "New here? Join us today with a free account."}
              </Text>

              {/* Enhanced Creative Instruction */}
              <View style={styles.instructionContainer}>
                <View style={styles.instructionBadge}>
                  <Text style={styles.instructionEmoji}>
                    {isLogin ? "🔐" : "✨"}
                  </Text>
                  <Text style={styles.instructionText}>
                    {/* {isLogin ? "Choose your method" : "Get started quickly"} */}
                    {isLogin
                      ? "Choose your preferred sign-in method"
                      : "Pick your favorite way to get started"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Auth Content Section */}
            <View style={styles.authSection}>
              <AuthContent
                isLogin={isLogin}
                onAuthenticate={authHandler}
                onSwitchMode={switchAuthModeHandler}
                onForgotPassword={handleForgotPassword}
                onPhoneAuth={handlePhoneAuth}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

export default UnifiedAuthScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
    maxWidth: 380,
    alignSelf: "center",
    width: "100%",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 4,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 2,
  },
  imageLogo: {
    width: 70,
    height: 65,
    borderRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.accent700,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
    color: Colors.accent600,
    marginBottom: 12,
    lineHeight: 18,
  },
  instructionContainer: {
    alignItems: "center",
    marginBottom: 4,
  },
  instructionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary200,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary300,
  },
  instructionEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  instructionText: {
    fontSize: 12,
    color: Colors.accent500,
    fontWeight: "500",
    fontStyle: "italic",
  },
  authSection: {
    marginHorizontal: 0,
  },
});
