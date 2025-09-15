// React Native Firebase v22 Configuration
// IMPORTANT: This must be the first import to avoid crashes
import "react-native-get-random-values";

// React Native Firebase v22 imports - Native implementation
import { firebase } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import Constants from "expo-constants";

// Import environment variables (for local development only)
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";

// Global flags to silence deprecation warnings for React Native Firebase v22
if (typeof globalThis !== 'undefined') {
  globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
  // globalThis.RNFB_MODULAR_DEPRECATION_STRICT_MODE = true; // Enable for debugging
}

// Get config from multiple sources with fallback priority
const configValues = {
  // First try EAS build env, then Constants extra, then local .env imports
  apiKey:
    process.env.FIREBASE_API_KEY ||
    Constants.expoConfig?.extra?.firebaseApiKey ||
    FIREBASE_API_KEY,
  authDomain:
    process.env.FIREBASE_AUTH_DOMAIN ||
    Constants.expoConfig?.extra?.firebaseAuthDomain ||
    FIREBASE_AUTH_DOMAIN,
  projectId:
    process.env.FIREBASE_PROJECT_ID ||
    Constants.expoConfig?.extra?.firebaseProjectId ||
    FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET ||
    Constants.expoConfig?.extra?.firebaseStorageBucket ||
    FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    Constants.expoConfig?.extra?.firebaseMessagingSenderId ||
    FIREBASE_MESSAGING_SENDER_ID,
  appId:
    process.env.FIREBASE_APP_ID ||
    Constants.expoConfig?.extra?.firebaseAppId ||
    FIREBASE_APP_ID,
};

// Validate required Firebase config
const requiredConfigs = [
  "apiKey",
  "authDomain", 
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const missingConfigs = requiredConfigs.filter((key) => {
  const value = configValues[key];
  return !value || value === "undefined";
});

if (missingConfigs.length > 0) {
  console.error("Missing Firebase configuration for:", missingConfigs);
  console.error("Config values:", configValues);
  console.error("Available env vars:", {
    "Constants extra keys": Object.keys(Constants.expoConfig?.extra || {}),
    "Constants extra values": Constants.expoConfig?.extra || {},
  });

  // In development, provide helpful error message
  if (__DEV__) {
    console.error("Development environment detected. Please check:");
    console.error("1. .env file exists and contains all Firebase config");
    console.error("2. babel.config.js includes react-native-dotenv plugin");
    console.error("3. Environment variables are correctly named");

    // Don't throw in dev, allow fallback to work
    console.warn("Continuing with available configuration...");
  } else {
    // In production, log error but don't crash the app immediately
    console.error(
      "Firebase configuration is incomplete. Some features may not work."
    );
    // Only throw if absolutely critical configs are missing
    if (!configValues.apiKey || !configValues.projectId) {
      throw new Error(
        "Critical Firebase configuration missing for production."
      );
    }
  }
}

const firebaseConfig = configValues;

let firebaseInitialized = false;
let initializationPromise = null;

// Initialize React Native Firebase
async function initializeFirebase() {
  if (firebaseInitialized) {
    console.log("🔄 React Native Firebase already initialized");
    return {
      app: firebase.app(),
      auth: auth(),
      db: firestore(),
      storage: storage(),
    };
  }

  if (initializationPromise) {
    console.log("⏳ Firebase initialization in progress, waiting...");
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log("🚀 Initializing React Native Firebase v22...");

      // React Native Firebase is automatically initialized from google-services files
      // We just need to get the instances
      
      // Check if default app exists
      let app;
      try {
        app = firebase.app();
        console.log("✅ Firebase app available");
      } catch (error) {
        console.error("❌ Firebase app not available:", error);
        throw error;
      }

      // Initialize services
      const authInstance = auth();
      const dbInstance = firestore();
      const storageInstance = storage();

      console.log("✅ Auth instance:", !!authInstance);
      console.log("✅ Firestore instance:", !!dbInstance);
      console.log("✅ Storage instance:", !!storageInstance);

      firebaseInitialized = true;
      console.log("🎉 React Native Firebase v22 initialization completed successfully");

      return {
        app,
        auth: authInstance,
        db: dbInstance,
        storage: storageInstance,
      };
    } catch (error) {
      console.error("❌ Critical React Native Firebase initialization failed:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        code: error.code || "N/A",
      });

      firebaseInitialized = false;
      initializationPromise = null;

      // Don't throw in production to keep app functional
      if (!__DEV__) {
        console.warn(
          "Production mode: Continuing with limited Firebase functionality"
        );
      }

      throw error;
    }
  })();

  return initializationPromise;
}

// Initialize Firebase immediately
const firebasePromise = initializeFirebase();

// Ensure Firebase is initialized before exporting
firebasePromise
  .then(() => {
    console.log("🔥 React Native Firebase services ready for export");
  })
  .catch((error) => {
    console.error("🚨 React Native Firebase initialization promise failed:", error);
  });

// Safe getter functions with initialization checks
export const getFirebaseAuth = async () => {
  const { auth: authInstance } = await firebasePromise;
  return authInstance;
};

export const getFirebaseDB = async () => {
  const { db: dbInstance } = await firebasePromise;
  return dbInstance;
};

export const getFirebaseStorage = async () => {
  const { storage: storageInstance } = await firebasePromise;
  return storageInstance;
};

// Direct exports for immediate use (React Native Firebase is synchronous)
export const db = firestore();
export const authInstance = auth();
export const storageInstance = storage();

// Backward compatibility
export { authInstance as auth, storageInstance as storage };

// Health check function
export const checkFirebaseHealth = async () => {
  try {
    const {
      app: healthApp,
      auth: healthAuth,
      db: healthDB,
      storage: healthStorage,
    } = await firebasePromise;

    const health = {
      app: !!healthApp,
      auth: !!healthAuth,
      db: !!healthDB,
      storage: !!healthStorage,
      initialized: firebaseInitialized,
    };

    // Only log if there are issues (not all services healthy)
    const allHealthy =
      health.app &&
      health.auth &&
      health.db &&
      health.storage &&
      health.initialized;
    if (!allHealthy) {
      console.log("🩺 React Native Firebase Health Check:", health);
    }

    return health;
  } catch (error) {
    console.error("🚨 React Native Firebase health check failed:", error);
    return {
      app: false,
      auth: false,
      db: false,
      storage: false,
      initialized: false,
      error: error.message,
    };
  }
};

// Re-initialization function for development hot reloads
export const reinitializeFirebase = async () => {
  console.log("🔄 Re-initializing React Native Firebase...");
  firebaseInitialized = false;
  initializationPromise = null;

  return await initializeFirebase();
};