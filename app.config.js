import "dotenv/config";

const googleUrlScheme = process.env.GOOGLE_URL_SCHEME;
const appName = "Build Bharat Mart";

// // Debug: Log environment variables during config evaluation
// console.log("=== APP CONFIG DEBUG ===");
// console.log("Environment variables available during config evaluation:");
// console.log("FIREBASE_API_KEY:", process.env.FIREBASE_API_KEY ? "SET" : "NOT SET");
// console.log("FIREBASE_AUTH_DOMAIN:", process.env.FIREBASE_AUTH_DOMAIN ? "SET" : "NOT SET");
// console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "SET" : "NOT SET");
// console.log("========================");

export default {
  expo: {
    name: appName,
    description: `A mobile application for  ${appName} , an e-commerce platform. Your one-stop shop for all your home improvement needs.`,
    slug: "build-bharat-mart",
    version: "1.0.0",
    orientation: "default", // Changed from "portrait" to allow auto-rotation
    icon: "./assets/icon.png", // changed from DarkBG_Logo.jpg to icon.png
    plugins: [
      ["expo-localization"],
      [
        "expo-image-picker",
        {
          photosPermission: `${appName} accesses your photos for your profile.`,
          // photosPermission: "The app accesses your photos for your profile.",
          cameraPermission: `${appName} accesses your camera to take photos for your profile.`,
        },
      ],
      "@react-native-firebase/app",
      "./plugins/withFirebaseModularHeaders",
      "./plugins/withGradleProperties.js",
      "./plugins/withAppComponentFactory.js",
      "@react-native-google-signin/google-signin",
      [
        "react-native-fbsdk-next",
        {
          appID: process.env.FACEBOOK_APP_ID,
          clientToken: process.env.FACEBOOK_CLIENT_TOKEN,
          displayName: "BBM - FacebooK login",
          scheme: `fb${process.env.FACEBOOK_APP_ID}`,
          advertiserIDCollectionEnabled: false,
          autoLogAppEventsEnabled: false,
          isAutoInitEnabled: true,
          iosUserTrackingPermission:
            "This identifier will be used to deliver personalized ads to you.",
          androidUserTrackingPermission: `${appName} uses tracking to provide personalized content and ads, and to improve your shopping experience.`,
        },
      ],
      "expo-tracking-transparency",
      "expo-apple-authentication",
      "expo-secure-store",
      [
        "@react-native-voice/voice",
        {
          microphonePermission: `Allow ${appName} Voice to Text to access the microphone`,
          speechRecognitionPermission: `Allow ${appName}  Voice to Text to securely recognize user speech`,
        },
      ],
    ],
    splash: {
      image: "./assets/splash.png", // changed from DarkBG_Logo.jpg to splash.png
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      buildNumber: "1.0.0",
      usesAppleSignIn: true,
      supportsTablet: true,
      bundleIdentifier: "com.noobdevtest.buildbharatmart.iOS",
      googleServicesFile: "./GoogleService-Info.plist",
      // This indicates that your iOS app only uses standard/exempt encryption, as required.
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSUserTrackingUsageDescription: ` ${appName} uses tracking to provide personalized content and ads, and to improve your shopping experience.`,
        SKAdNetworkItems: [
          {
            SKAdNetworkIdentifier: "v9wttpbfk9.skadnetwork",
          },
          {
            SKAdNetworkIdentifier: "n38lu8286q.skadnetwork",
          },
        ],
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [googleUrlScheme],
          },
        ],
      },
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "com.google.android.gms.permission.AD_ID",
      ],
      package: "com.noobdevtest.buildbharatmart.android",
      edgeToEdgeEnabled: true,
      googleServicesFile: "./google-services.json",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },

    extra: {
      eas: {
        projectId: "25b43c15-56b1-475f-bd21-8ff9122e6451",
      },
      // Environment variables - These will be available via Constants.expoConfig.extra
      firebaseApiKey: process.env.FIREBASE_API_KEY || null,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || null,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || null,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || null,
      firebaseMessagingSenderId:
        process.env.FIREBASE_MESSAGING_SENDER_ID || null,
      firebaseAppId: process.env.FIREBASE_APP_ID || null,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || null,
      // API URLs for external services
      apiUrl: process.env.EXPO_PUBLIC_API_URL || null,
      googleMapsStaticApiUrl:
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_STATIC_API_URL || null,
      googleMapsGeocodingApiUrl:
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_GEOCODING_API_URL || null,
      // whatsApp configs
      WA_PHONE_NUMBER_ID: process.env.WA_PHONE_NUMBER_ID,
      WA_BUSINESS_ACCOUNT_ID: process.env.WA_BUSINESS_ACCOUNT_ID,
      CLOUD_API_ACCESS_TOKEN: process.env.CLOUD_API_ACCESS_TOKEN,
      EXPO_PUBLIC_CLOUD_API_VERSION: process.env.EXPO_PUBLIC_CLOUD_API_VERSION,
    },
  },
};
