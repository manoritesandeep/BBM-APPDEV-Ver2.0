import { FIREBASE_API_KEY } from "@env";

// Simple test to verify Firebase API key configuration
export function testFirebaseConfig() {
  // console.log("🔧 Testing Firebase configuration...");
  // console.log("API Key exists:", !!FIREBASE_API_KEY);
  // console.log("API Key length:", FIREBASE_API_KEY?.length || 0);
  // console.log(
  //   "API Key starts with 'AIza':",
  //   FIREBASE_API_KEY?.startsWith("AIza") || false
  // );

  if (!FIREBASE_API_KEY) {
    console.error("❌ Firebase API key is missing!");
    return false;
  }

  if (!FIREBASE_API_KEY.startsWith("AIza")) {
    console.error("❌ Firebase API key format appears incorrect!");
    return false;
  }

  console.log("✅ Firebase configuration appears valid");
  return true;
}

// Test Firebase Auth endpoint availability
export async function testFirebaseEndpoint() {
  const testUrl = `https://identitytoolkit.googleapis.com/v1/projects?key=${FIREBASE_API_KEY}`;

  try {
    const response = await fetch(testUrl);
    console.log("🌐 Firebase endpoint test - Status:", response.status);

    if (response.status === 403) {
      console.log("⚠️ API key works but may need additional permissions");
      return true;
    }

    if (response.status >= 200 && response.status < 300) {
      console.log("✅ Firebase endpoint accessible");
      return true;
    }

    console.log("❌ Firebase endpoint test failed");
    return false;
  } catch (error) {
    console.error("❌ Firebase endpoint test error:", error);
    return false;
  }
}
