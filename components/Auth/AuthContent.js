// Enhanced Authentication Content - Unified Login/Signup Experience
import { useState } from "react";
import { Alert, StyleSheet, View, Text } from "react-native";
import FlatButton from "../UI/authUI/FlatButton";
import AuthForm from "./AuthForm";
import { Colors } from "../../constants/styles";
import SocialLoginContainer from "./SocialLoginContainer";
import { useToast } from "../UI/Toast";
import { useI18n } from "../../store/i18n-context";

function AuthContent({
  isLogin,
  onAuthenticate,
  onSwitchMode,
  onForgotPassword,
}) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [credentialsInvalid, setCredentialsInvalid] = useState({
    email: false,
    password: false,
    confirmEmail: false,
    confirmPassword: false,
  });

  function submitHandler(credentials) {
    let { email, confirmEmail, password, confirmPassword, name, address } =
      credentials;

    name = name.trim();
    email = email.trim();
    password = password.trim();

    const emailIsValid = email.includes("@");
    const passwordIsValid = password.length > 6;
    const emailsAreEqual = email === confirmEmail;
    const passwordsAreEqual = password === confirmPassword;

    if (
      !emailIsValid ||
      !passwordIsValid ||
      (!isLogin && (!emailsAreEqual || !passwordsAreEqual))
    ) {
      showToast(t("auth.invalidCredentials"), "error", 3000);
      setCredentialsInvalid({
        email: !emailIsValid,
        confirmEmail: !emailIsValid || !emailsAreEqual,
        password: !passwordIsValid,
        confirmPassword: !passwordIsValid || !passwordsAreEqual,
      });
      return;
    }
    // Pass all credentials, including name and address, to onAuthenticate
    onAuthenticate({ email, password, name, address });
  }

  return (
    <View style={styles.authContent}>
      {/* Email/Password Section */}
      <View style={styles.emailSection}>
        <Text style={styles.sectionTitle}>
          {isLogin
            ? t("auth.signInWithEmail")
            : t("auth.createAccountWithEmail")}
        </Text>
        <AuthForm
          isLogin={isLogin}
          onSubmit={submitHandler}
          credentialsInvalid={credentialsInvalid}
          onForgotPassword={onForgotPassword}
        />
      </View>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login Section */}
      <View style={styles.socialSection}>
        <Text style={styles.sectionTitle}>
          {isLogin ? t("auth.signInWithSocial") : t("auth.signUpWithSocial")}
        </Text>
        <SocialLoginContainer />
      </View>

      {/* Switch Mode Button */}
      <View style={styles.buttons}>
        <FlatButton onPress={onSwitchMode}>
          {isLogin
            ? t("auth.newHereCreateAccount")
            : t("auth.alreadyHaveAccountSignIn")}
        </FlatButton>
      </View>
    </View>
  );
}

export default AuthContent;

const styles = StyleSheet.create({
  authContent: {
    marginTop: 4,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary100,
    elevation: 2,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  emailSection: {
    marginBottom: 12,
  },
  socialSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.accent700,
    marginBottom: 10,
    textAlign: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.primary300,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: "500",
    color: Colors.accent500,
  },
  buttons: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.primary200,
    paddingTop: 10,
  },
});
