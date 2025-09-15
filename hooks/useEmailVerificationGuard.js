import React, { useContext } from "react";
import { Alert } from "react-native";
import { UserContext } from "../store/user-context";

/**
 * Higher-order component that protects features requiring email verification
 * Shows an alert and redirects unverified users to verification screen
 */
export const withEmailVerification = (
  WrappedComponent,
  featureName = "this feature"
) => {
  return function EmailVerifiedComponent(props) {
    const userCtx = useContext(UserContext);
    const { navigation } = props;

    const checkVerificationAndProceed = (callback) => {
      // If user is verified, proceed normally
      if (userCtx.user?.emailVerified) {
        if (callback) callback();
        return true;
      }

      // If user has limited access (skipped verification), block access
      if (userCtx.user?.limitedAccess || userCtx.user?.skippedVerification) {
        Alert.alert(
          "Email Verification Required",
          `To use ${featureName}, please verify your email address. This helps us prevent fraud and protect all users.`,
          [
            {
              text: "Verify Now",
              onPress: () => {
                // Double-check verification status before navigating
                if (userCtx.user?.emailVerified) {
                  Alert.alert(
                    "Already Verified!",
                    "Your email is already verified. You have full access!"
                  );
                  return;
                }
                navigation?.navigate("UserScreen", {
                  screen: "EmailVerification",
                  params: {
                    userEmail: userCtx.user?.email,
                  },
                });
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
        return false;
      }

      // For new users who haven't seen verification screen yet
      Alert.alert(
        "Email Verification Required",
        `Please verify your email to use ${featureName}.`,
        [
          {
            text: "Verify Now",
            onPress: () => {
              // Double-check verification status before navigating
              if (userCtx.user?.emailVerified) {
                Alert.alert(
                  "Already Verified!",
                  "Your email is already verified. You have full access!"
                );
                return;
              }
              navigation?.navigate("UserScreen", {
                screen: "EmailVerification",
                params: {
                  userEmail: userCtx.user?.email,
                },
              });
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
      return false;
    };

    return (
      <WrappedComponent
        {...props}
        checkVerificationAndProceed={checkVerificationAndProceed}
        isEmailVerified={userCtx.user?.emailVerified || false}
      />
    );
  };
};

/**
 * Hook for checking email verification status in functional components
 */
export const useEmailVerificationGuard = (navigation) => {
  const userCtx = useContext(UserContext);

  const requireVerification = (featureName = "this feature", callback) => {
    // If user is verified, proceed
    if (userCtx.user?.emailVerified) {
      if (callback) callback();
      return true;
    }

    // Show verification required alert
    Alert.alert(
      "Email Verification Required",
      `To use ${featureName}, please verify your email address. This helps us prevent fraud and protect all users.`,
      [
        {
          text: "Verify Now",
          onPress: () => {
            // Double-check verification status before navigating
            if (userCtx.user?.emailVerified) {
              Alert.alert(
                "Already Verified!",
                "Your email is already verified. You have full access!"
              );
              return;
            }
            navigation?.navigate("UserScreen", {
              screen: "EmailVerification",
              params: {
                userEmail: userCtx.user?.email,
              },
            });
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
    return false;
  };

  return {
    isEmailVerified: userCtx.user?.emailVerified || false,
    hasLimitedAccess:
      userCtx.user?.limitedAccess || userCtx.user?.skippedVerification || false,
    requireVerification,
  };
};

export default withEmailVerification;
