/**
 * Firebase Phone Authentication Production Configuration Guide
 *
 * This document outlines the necessary steps to make phone authentication
 * work in production with real phone numbers.
 */

export const FirebasePhoneAuthProductionConfig = {
  // 1. Firebase Console Configuration
  firebaseConsoleSteps: {
    authentication: [
      "1. Go to Firebase Console > Authentication > Sign-in method",
      "2. Enable Phone authentication provider",
      "3. Add your app's SHA-1 and SHA-256 fingerprints (Android)",
      "4. Configure App Check for phone auth security",
      "5. Set up reCAPTCHA Enterprise (recommended for production)",
    ],

    appCheck: [
      "1. Go to Firebase Console > App Check",
      "2. Enable App Check for your app",
      "3. For Android: Use Play Integrity or Safety Net",
      "4. For iOS: Use App Attest or DeviceCheck",
      "5. Add your app's bundle ID and package name",
    ],

    quotasAndLimits: [
      "1. Check Phone Auth quotas in Firebase Console",
      "2. Default: 10 SMS/minute, 100 SMS/hour, 1000 SMS/day per project",
      "3. Request quota increase if needed",
      "4. Monitor usage in Firebase Console > Usage tab",
    ],
  },

  // 2. Android Configuration
  androidConfig: {
    buildGradle: {
      file: "android/build.gradle",
      required: [
        "Google Services plugin",
        "Correct google-services.json placement",
        "SHA fingerprints in Firebase Console",
      ],
    },

    googleServices: {
      file: "android/app/google-services.json",
      requirements: [
        "Downloaded from Firebase Console",
        "Matches your app's package name",
        "Contains correct API keys and project info",
      ],
    },

    playIntegrity: [
      "Required for production phone auth",
      "Configure in Google Play Console",
      "Link to Firebase App Check",
    ],
  },

  // 3. iOS Configuration
  iosConfig: {
    googleServicesPlist: {
      file: "ios/GoogleService-Info.plist",
      requirements: [
        "Downloaded from Firebase Console",
        "Matches your app's bundle ID",
        "Added to Xcode project",
      ],
    },

    pushNotifications: [
      "Enable Push Notifications capability in Xcode",
      "Upload APNs certificate to Firebase Console",
      "Required for silent push notifications during auth",
    ],

    appAttest: [
      "Enable App Attest in Apple Developer Console",
      "Configure in Firebase App Check",
      "Required for production security",
    ],
  },

  // 4. Common Issues and Solutions
  troubleshooting: {
    testNumbers: {
      issue: "Only test numbers work",
      solutions: [
        "Ensure App Check is properly configured",
        "Check Firebase Console for auth errors",
        "Verify SHA fingerprints match your build",
        "Confirm phone provider is enabled in Firebase Console",
      ],
    },

    recaptcha: {
      issue: "reCAPTCHA appearing frequently",
      solutions: [
        "Configure reCAPTCHA Enterprise instead of v2",
        "Set up App Check properly",
        "Use production build instead of development",
        "Add domain verification in Firebase Console",
      ],
    },

    quotaExceeded: {
      issue: "SMS sending fails due to quotas",
      solutions: [
        "Monitor usage in Firebase Console",
        "Request quota increase",
        "Implement rate limiting in app",
        "Use test numbers for development",
      ],
    },
  },

  // 5. Production Deployment Checklist
  productionChecklist: [
    "✅ App Check configured and enabled",
    "✅ reCAPTCHA Enterprise set up",
    "✅ SHA fingerprints added to Firebase Console",
    "✅ google-services.json/GoogleService-Info.plist updated",
    "✅ Phone auth provider enabled in Firebase Console",
    "✅ Push notification certificates uploaded (iOS)",
    "✅ Play Integrity configured (Android)",
    "✅ Domain verification completed",
    "✅ Quota limits reviewed and increased if needed",
    "✅ Error monitoring set up",
    "✅ Tested with real phone numbers in staging environment",
  ],

  // 6. Environment-specific Configuration
  environments: {
    development: {
      useTestNumbers: true,
      testNumbers: ["+15555555555", "+919999998645"],
      recaptchaVisible: true,
      appCheckEnforcement: "off",
    },

    staging: {
      useTestNumbers: false,
      realNumbersTesting: true,
      recaptchaVisible: false,
      appCheckEnforcement: "unenforced",
    },

    production: {
      useTestNumbers: false,
      realNumbersOnly: true,
      recaptchaVisible: false,
      appCheckEnforcement: "enforced",
    },
  },
};

// Immediate Actions Needed for Production Phone Auth:

export const ImmediateActions = {
  step1_AppCheck: {
    description: "Enable App Check in Firebase Console",
    priority: "HIGH",
    steps: [
      "1. Go to Firebase Console > App Check",
      "2. Register your app if not already done",
      "3. For Android: Enable Play Integrity API",
      "4. For iOS: Enable App Attest",
      "5. Set enforcement to 'Unenforced' initially for testing",
    ],
  },

  step2_ReCAPTCHAEnterprise: {
    description: "Configure reCAPTCHA Enterprise",
    priority: "HIGH",
    steps: [
      "1. Go to Google Cloud Console > Security > reCAPTCHA Enterprise",
      "2. Create a new site key for your app",
      "3. Configure it in Firebase Console > Authentication > Settings",
      "4. Add your app domains to allowed domains",
    ],
  },

  step3_AppFingerprints: {
    description: "Add production app fingerprints",
    priority: "CRITICAL",
    steps: [
      "1. Generate production SHA-1 and SHA-256 fingerprints",
      "2. Add them to Firebase Console > Project Settings > Your apps",
      "3. Download updated google-services.json/GoogleService-Info.plist",
      "4. Replace files in your project",
    ],
  },

  step4_QuotaReview: {
    description: "Review and increase SMS quotas",
    priority: "MEDIUM",
    steps: [
      "1. Check current usage in Firebase Console > Usage",
      "2. Request quota increase if needed",
      "3. Set up monitoring alerts for quota usage",
      "4. Implement app-side rate limiting",
    ],
  },
};

export default FirebasePhoneAuthProductionConfig;
