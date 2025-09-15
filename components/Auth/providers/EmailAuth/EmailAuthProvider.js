import { useContext, useState } from "react";
import { Alert } from "react-native";
import { doc, getDoc } from "@react-native-firebase/firestore";
import { getFirebaseDB } from "../../../../util/firebaseConfig";
import {
  login,
  createUser,
  checkEmailVerification,
  updateUserVerificationStatus,
  sendPasswordResetEmail,
} from "../../../../util/auth";
import { AuthContext } from "../../../../store/auth-context";
import { UserContext } from "../../../../store/user-context";
import { useToast } from "../../../UI/Toast";

/**
 * Email Authentication Provider Hook
 * Handles both login and signup functionality for email/password authentication
 * Now includes email verification functionality with toast notifications
 */
export function useEmailAuth() {
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { showToast } = useToast();

  async function handleEmailAuth(
    { email, password, name, address },
    isLogin,
    navigation
  ) {
    setIsAuthenticating(true);

    try {
      let token, userId, refreshToken;

      if (isLogin) {
        ({ token, userId, refreshToken } = await login(email, password));

        // Check email verification status for existing users
        try {
          const verificationStatus = await checkEmailVerification(token);

          // Update verification status in Firestore if it has changed
          if (verificationStatus.emailVerified) {
            await updateUserVerificationStatus(userId, true);
          }
        } catch (verificationError) {
          console.warn(
            "Could not check verification status:",
            verificationError
          );
        }
      } else {
        ({ token, userId, refreshToken } = await createUser(
          email,
          password,
          name,
          address
        ));
      }

      // For new signups, handle verification flow first before setting auth context
      if (!isLogin) {
        // Fetch user profile but don't authenticate yet
        try {
          const db = await getFirebaseDB();
          if (db) {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userCtx.setUser(userData);
            }
          }
        } catch (dbError) {
          console.warn("Failed to fetch user profile:", dbError);
        }

        setIsAuthenticating(false);

        // Navigate to verification screen with a slight delay to show success
        showToast(
          "Account created! Please verify your email.",
          "success",
          3000
        );

        // Small delay to show success message before navigation
        setTimeout(() => {
          navigation?.navigate("EmailVerification", {
            userEmail: email,
            token,
            userId,
            refreshToken,
          });
        }, 500);
        return;
      }

      // Authenticate with app context (for login only at this point)
      authCtx.authenticate(token, userId, "email", refreshToken);

      // Fetch and set user profile from Firestore (for login only)
      try {
        const db = await getFirebaseDB();
        if (db) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userCtx.setUser(userData);

            // For existing users, show verification banner if not verified
            if (!userData.emailVerified) {
              showToast(
                "Please verify your email to access all features",
                "warning",
                4000
              );

              Alert.alert(
                "Email Not Verified",
                "Please verify your email address to access all features. You can continue shopping, but some features may be limited.",
                [
                  {
                    text: "Verify Now",
                    onPress: () => {
                      setIsAuthenticating(false);
                      navigation?.navigate("EmailVerification", {
                        userEmail: email,
                      });
                    },
                  },
                  {
                    text: "Later",
                    style: "cancel",
                    onPress: () => setIsAuthenticating(false),
                  },
                ]
              );
              return;
            }
          } else {
            userCtx.setUser({ email, name, emailVerified: false });
          }
        } else {
          console.warn("Database not available, using email only");
          userCtx.setUser({ email, name, emailVerified: false });
        }
      } catch (dbError) {
        console.warn("Database error during authentication:", dbError);
        userCtx.setUser({ email, name, emailVerified: false });
      }

      // Authentication successful - loading state will be handled by parent
      setIsAuthenticating(false);

      // Show success message for login
      if (isLogin) {
        showToast("Welcome back! Successfully logged in.", "success", 3000);
      }
    } catch (error) {
      // Handle authentication errors with toast notifications
      const errorMessage = isLogin
        ? "Could not log you in. Please check your credentials or try again later!"
        : "Could not create user, please check your input and try again later.";

      showToast(errorMessage, "error", 4000);

      Alert.alert("Authentication failed!", errorMessage);
      setIsAuthenticating(false);
    }
  }

  async function handlePasswordReset(email) {
    try {
      await sendPasswordResetEmail(email);
      showToast(
        "Password reset email sent! Check your inbox.",
        "success",
        4000
      );
      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      showToast(error.message, "error", 4000);
      return { success: false, error: error.message };
    }
  }

  return {
    handleEmailAuth,
    handlePasswordReset,
    isAuthenticating,
    showToast,
  };
}

export default useEmailAuth;
