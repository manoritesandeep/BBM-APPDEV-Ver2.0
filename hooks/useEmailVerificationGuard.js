import React, { useContext } from "react";
import { Alert } from "react-native";
import { UserContext } from "../store/user-context";
import { AuthContext } from "../store/auth-context";
import PhoneUserEmailService from "../components/Auth/providers/Phone/services/PhoneUserEmailService";

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
    const authCtx = useContext(AuthContext);
    const { navigation } = props;

    const checkVerificationAndProceed = (callback) => {
      // If user is not authenticated, allow proceeding (guest flow)
      if (!authCtx.isAuthenticated || !userCtx.user) {
        if (callback) callback();
        return true;
      }

      // Check if authenticated user can use features (includes phone auth users)
      if (PhoneUserEmailService.canPlaceOrders(userCtx.user)) {
        if (callback) callback();
        return true;
      }

      // If user has limited access (skipped verification), show alert with guest option
      if (userCtx.user?.limitedAccess || userCtx.user?.skippedVerification) {
        Alert.alert(
          "Email Verification Required",
          `To use ${featureName} with your account, please verify your email address or phone number. Alternatively, you can log out and proceed as a guest.`,
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
              text: "Proceed as Guest",
              onPress: () => {
                Alert.alert(
                  "Logout Required",
                  "To proceed as guest, you need to log out first. Your data will be preserved. Do you want to continue?",
                  [
                    {
                      text: "Yes, Logout",
                      onPress: async () => {
                        await authCtx.logout();
                        // After logout, proceed with the callback
                        if (callback) callback();
                      },
                    },
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                  ]
                );
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
        `To use ${featureName} with your account, please verify your email address or phone number. Alternatively, you can log out and proceed as a guest.`,
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
            text: "Proceed as Guest",
            onPress: () => {
              Alert.alert(
                "Logout Required",
                "To proceed as guest, you need to log out first. Your data will be preserved. Do you want to continue?",
                [
                  {
                    text: "Yes, Logout",
                    onPress: async () => {
                      await authCtx.logout();
                      // After logout, proceed with the callback
                      if (callback) callback();
                    },
                  },
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                ]
              );
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
        canPlaceOrders={
          userCtx.user
            ? PhoneUserEmailService.canPlaceOrders(userCtx.user)
            : false
        }
      />
    );
  };
};

/**
 * Hook for checking email verification status in functional components
 */
export const useEmailVerificationGuard = (navigation) => {
  const userCtx = useContext(UserContext);
  const authCtx = useContext(AuthContext);

  const requireVerification = (featureName = "this feature", callback) => {
    // If user is not authenticated, allow proceeding (guest checkout flow)
    if (!authCtx.isAuthenticated || !userCtx.user) {
      if (callback) callback();
      return true;
    }

    // Check if authenticated user can place orders (includes phone auth users)
    if (PhoneUserEmailService.canPlaceOrders(userCtx.user)) {
      if (callback) callback();
      return true;
    }

    // Show verification required alert with guest checkout option
    Alert.alert(
      "Email Verification Required",
      `To use ${featureName} with your account, please verify your email address or phone number. Alternatively, you can log out and checkout as a guest.`,
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
          text: "Checkout as Guest",
          onPress: () => {
            Alert.alert(
              "Logout Required",
              "To checkout as guest, you need to log out first. Your cart items will be preserved. Do you want to continue?",
              [
                {
                  text: "Yes, Logout",
                  onPress: async () => {
                    await authCtx.logout();
                    // After logout, proceed with the callback (navigation to billing)
                    if (callback) callback();
                  },
                },
                {
                  text: "Cancel",
                  style: "cancel",
                },
              ]
            );
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
    canPlaceOrders: userCtx.user
      ? PhoneUserEmailService.canPlaceOrders(userCtx.user)
      : false,
    hasLimitedAccess:
      userCtx.user?.limitedAccess || userCtx.user?.skippedVerification || false,
    requireVerification,
  };
};

export default withEmailVerification;
