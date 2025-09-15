import auth from "@react-native-firebase/auth";

/**
 * Check if Facebook authentication is properly configured in Firebase
 */
export const checkFacebookAuthConfig = async () => {
  try {
    const authInstance = auth();

    // Try to get the current configuration
    const config = authInstance.config;

    console.log("🔍 Checking Firebase Auth configuration...");
    console.log("📋 Project ID:", authInstance.app.options.projectId);
    console.log("🌐 Auth Domain:", authInstance.app.options.authDomain);

    // This will help identify if the provider is configured
    return {
      projectId: authInstance.app.options.projectId,
      authDomain: authInstance.app.options.authDomain,
      isConfigured: true,
      message:
        "Firebase Auth initialized - Please check console for provider setup",
    };
  } catch (error) {
    console.error("❌ Firebase Auth configuration check failed:", error);
    return {
      isConfigured: false,
      error: error.message,
      message: "Firebase Auth configuration error",
    };
  }
};

/**
 * Enhanced error handler for Facebook authentication
 */
export const handleFacebookAuthError = (error) => {
  console.error("🔥 Firebase Facebook Auth Error Details:");
  console.error("- Error Code:", error.code);
  console.error("- Error Message:", error.message);
  console.error("- Full Error:", error);

  const errorMessages = {
    "auth/operation-not-allowed": {
      title: "Facebook Sign-In Not Enabled",
      message: "Facebook authentication is not enabled in Firebase Console.",
      solution: `
📋 To fix this:
1. Go to Firebase Console → Authentication → Sign-in method
2. Find "Facebook" and click to enable it
3. Add your Facebook App ID and App Secret
4. Save the configuration
5. Wait 5-10 minutes for changes to propagate
      `,
    },
    "auth/app-not-authorized": {
      title: "App Not Authorized",
      message: "This app is not authorized to use Firebase Authentication.",
      solution:
        "Check your Firebase project configuration and app registration.",
    },
    "auth/invalid-api-key": {
      title: "Invalid API Key",
      message: "The Firebase API key is invalid or missing.",
      solution:
        "Check your Firebase configuration in app.config.js or .env files.",
    },
    "auth/network-request-failed": {
      title: "Network Error",
      message: "Network request failed. Check your internet connection.",
      solution: "Ensure stable internet connection and try again.",
    },
  };

  const errorInfo = errorMessages[error.code] || {
    title: "Unknown Authentication Error",
    message: error.message,
    solution: "Please check Firebase and Facebook app configurations.",
  };

  console.error("🎯 Specific Error Info:");
  console.error("- Title:", errorInfo.title);
  console.error("- Message:", errorInfo.message);
  console.error("- Solution:", errorInfo.solution);

  return errorInfo;
};

/**
 * Debug Facebook authentication setup
 */
export const debugFacebookAuth = async () => {
  console.log("🐛 Facebook Authentication Debug Info:");

  // Check Firebase config
  const configCheck = await checkFacebookAuthConfig();
  console.log("✅ Firebase Config Check:", configCheck);

  // Environment check
  console.log("🌍 Environment Variables:");
  console.log("- NODE_ENV:", process.env.NODE_ENV);
  console.log(
    "- EXPO_PUBLIC_ENVIRONMENT:",
    process.env.EXPO_PUBLIC_ENVIRONMENT
  );

  // Firebase project info
  try {
    const authInstance = auth();
    console.log("🔥 Firebase Project Info:");
    console.log("- Project ID:", authInstance.app.options.projectId);
    console.log("- Auth Domain:", authInstance.app.options.authDomain);
    console.log(
      "- API Key:",
      authInstance.app.options.apiKey ? "✅ Present" : "❌ Missing"
    );
  } catch (error) {
    console.error("❌ Failed to get Firebase info:", error.message);
  }

  return configCheck;
};
