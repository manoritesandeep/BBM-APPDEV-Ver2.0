// Social Authentication utilities for Google, Facebook, and Apple
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  AccessToken,
  LoginManager,
  GraphRequest,
  GraphRequestManager,
} from "react-native-fbsdk-next";
import * as AppleAuthentication from "expo-apple-authentication";
import { jwtDecode } from "jwt-decode";
import auth from "@react-native-firebase/auth";
import { getFirebaseAuth, getFirebaseDB } from "./firebaseConfig";
import { doc, setDoc, getDoc } from "@react-native-firebase/firestore";
import { GOOGLE_AUTH_CONFIG } from "../components/Auth/providers/Google/config/constants";
import { FACEBOOK_AUTH_CONFIG } from "../components/Auth/providers/Facebook/config/constants";
import {
  handleFacebookAuthError,
  debugFacebookAuth,
} from "./facebookAuthDebug";

// Initialize Google Sign-In
GoogleSignin.configure(GOOGLE_AUTH_CONFIG);

/**
 * Google Authentication Handler
 * Handles Google sign-in and Firebase authentication integration
 */
export const signInWithGoogle = async () => {
  try {
    console.log("🔑 Starting Google Sign-In process...");

    // Check if Google Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Get Google user info
    const userInfo = await GoogleSignin.signIn();

    // Extract ID token from user info
    const idToken = userInfo.data?.idToken || userInfo.idToken;

    if (!idToken) {
      console.error("Google sign-in user info:", userInfo);
      throw new Error("Google sign-in failed: No ID token received");
    }

    console.log(
      "✅ Google sign-in successful, authenticating with Firebase..."
    );

    // Get Firebase auth instance safely
    const authInstance = await getFirebaseAuth();
    if (!authInstance) {
      throw new Error("Firebase Auth is not available");
    }

    // Create Firebase credential with Google ID token
    // Use the imported auth module to access GoogleAuthProvider
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign in with Firebase using Google credential
    const userCredential = await authInstance.signInWithCredential(
      googleCredential
    );
    const user = userCredential.user;

    console.log("✅ Firebase authentication successful");

    // Extract user information
    const userInfoData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "",
      profilePhotoUrl: user.photoURL || "",
      emailVerified: user.emailVerified,
      provider: "google",
      createdAt: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    };

    // Get Firestore instance safely
    const db = await getFirebaseDB();
    if (!db) {
      console.warn("Firestore not available, skipping user document creation");
      return {
        token: await user.getIdToken(),
        userId: user.uid,
        userInfo: userInfoData,
      };
    }

    // Check if user exists in Firestore and create/update profile
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create new user document
      console.log("🆕 Creating new user document in Firestore...");
      await setDoc(userDocRef, userInfoData);
      console.log("✅ User document created successfully");
    } else {
      // Update existing user document with latest information
      console.log("🔄 Updating existing user document...");
      const existingData = userDoc.data();
      const updatedData = {
        ...existingData,
        name: userInfoData.name || existingData.name,
        profilePhotoUrl:
          userInfoData.profilePhotoUrl || existingData.profilePhotoUrl,
        emailVerified: userInfoData.emailVerified,
        lastSignInTime: userInfoData.lastSignInTime,
      };
      await setDoc(userDocRef, updatedData, { merge: true });
      console.log("✅ User document updated successfully");
    }

    // Return user info for context updates
    return {
      token: await user.getIdToken(),
      userId: user.uid,
      userInfo: userInfoData,
    };
  } catch (error) {
    console.error("❌ Google sign-in failed:", error);

    // Handle specific error cases
    if (error.code === "auth/account-exists-with-different-credential") {
      throw new Error(
        "An account already exists with the same email address but different sign-in credentials. Please use the original sign-in method."
      );
    } else if (error.code === "auth/invalid-credential") {
      throw new Error(
        "The credential is invalid or has expired. Please try again."
      );
    } else if (error.code === "auth/operation-not-allowed") {
      throw new Error("Google sign-in is not enabled. Please contact support.");
    } else if (error.code === "auth/user-disabled") {
      throw new Error(
        "This user account has been disabled. Please contact support."
      );
    } else if (error.code === "auth/network-request-failed") {
      throw new Error(
        "Network error occurred. Please check your connection and try again."
      );
    } else if (
      error.message?.includes("Component auth has not been registered yet")
    ) {
      throw new Error(
        "Authentication service is not ready. Please restart the app and try again."
      );
    }

    throw error;
  }
};

/**
 * Sign out from Google and Firebase
 */
export const signOutFromGoogle = async () => {
  try {
    console.log("🔓 Signing out from Google...");

    // Get Firebase auth instance safely
    const auth = await getFirebaseAuth();

    // Sign out from Firebase
    if (auth && auth.currentUser) {
      await auth.signOut();
      console.log("✅ Firebase sign-out successful");
    }

    // Sign out from Google
    await GoogleSignin.signOut();
    console.log("✅ Google sign-out successful");

    return true;
  } catch (error) {
    console.error("❌ Sign-out failed:", error);
    throw error;
  }
};

/**
 * Check if user is currently signed in with Google
 */
export const isGoogleSignedIn = async () => {
  try {
    return await GoogleSignin.isSignedIn();
  } catch (error) {
    console.error("Error checking Google sign-in status:", error);
    return false;
  }
};

/**
 * Get current Google user info
 */
export const getCurrentGoogleUser = async () => {
  try {
    const userInfo = await GoogleSignin.getCurrentUser();
    return userInfo;
  } catch (error) {
    console.error("Error getting current Google user:", error);
    return null;
  }
};

// Placeholder functions for future Facebook and Apple integration

/**
 * Handle Facebook authentication when Facebook login is already completed
 * (e.g., when using the official LoginButton)
 */
export const completeFacebookSignIn = async (accessTokenString) => {
  try {
    console.log("🔑 Completing Facebook Sign-In with existing access token...");

    if (!accessTokenString) {
      throw new Error(
        "No access token provided for Facebook sign-in completion"
      );
    }

    // Get user profile from Facebook Graph API
    const userProfile = await new Promise((resolve, reject) => {
      try {
        const infoRequest = new GraphRequest(
          "/me",
          {
            accessToken: accessTokenString,
            parameters: {
              fields: {
                string:
                  "id,name,email,picture.type(large),first_name,last_name",
              },
            },
          },
          (error, result) => {
            if (error) {
              console.error("Facebook Graph API error:", error);
              reject(
                new Error(`Facebook API Error: ${error.message || error}`)
              );
            } else if (result) {
              // console.log(
              //   "Facebook Graph API result:",
              //   JSON.stringify(result, null, 2)
              // );

              // Validate that we have the picture data
              if (result.picture?.data?.url) {
                // console.log(
                //   "✅ Facebook profile picture URL found:",
                //   result.picture.data.url
                // );
              } else {
                console.warn(
                  "⚠️ Facebook profile picture not found in API response"
                );
              }

              resolve(result);
            } else {
              reject(new Error("No result from Facebook Graph API"));
            }
          }
        );

        const manager = new GraphRequestManager();
        manager.addRequest(infoRequest);
        manager.start();
      } catch (err) {
        reject(
          new Error(`Failed to create Facebook Graph request: ${err.message}`)
        );
      }
    });

    console.log(
      "✅ Facebook user profile retrieved, authenticating with Firebase..."
    );

    // Get Firebase auth instance safely
    const auth = await getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase Auth is not available");
    }

    // Create Firebase credential with Facebook access token
    const facebookCredential =
      auth.FacebookAuthProvider.credential(accessTokenString);

    // Sign in with Firebase using Facebook credential
    const userCredential = await auth().signInWithCredential(
      facebookCredential
    );
    const user = userCredential.user;

    console.log("✅ Firebase authentication successful");

    // Extract user information with better profile photo handling
    const profilePhotoUrl =
      userProfile.picture?.data?.url || user.photoURL || "";

    // console.log("📸 Facebook Profile Photo Debug:");
    // console.log(
    //   "- Full picture object:",
    //   JSON.stringify(userProfile.picture, null, 2)
    // );
    // console.log("- Extracted photo URL:", profilePhotoUrl);
    // console.log("- Firebase photoURL:", user.photoURL);

    const userInfoData = {
      uid: user.uid,
      email: user.email || userProfile.email || "",
      name: user.displayName || userProfile.name || "",
      profilePhotoUrl: profilePhotoUrl,
      emailVerified: user.emailVerified,
      provider: "facebook",
      facebookId: userProfile.id,
      createdAt: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    };

    // Get Firestore instance safely
    const db = await getFirebaseDB();
    if (!db) {
      console.warn("Firestore not available, skipping user document creation");
      return {
        token: await user.getIdToken(),
        userId: user.uid,
        userInfo: userInfoData,
      };
    }

    // Check if user exists in Firestore and create/update profile
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create new user document
      console.log("🆕 Creating new user document in Firestore...");
      await setDoc(userDocRef, userInfoData);
      console.log("✅ User document created successfully");
    } else {
      // Update existing user document with latest information
      console.log("🔄 Updating existing user document...");
      const existingData = userDoc.data();
      const updatedData = {
        ...existingData,
        name: userInfoData.name || existingData.name,
        // Always update profile photo from Facebook if available
        profilePhotoUrl:
          userInfoData.profilePhotoUrl || existingData.profilePhotoUrl,
        emailVerified: userInfoData.emailVerified,
        lastSignInTime: userInfoData.lastSignInTime,
        facebookId: userInfoData.facebookId,
      };

      // console.log("📸 Profile photo update debug:");
      // console.log("- Previous photo URL:", existingData.profilePhotoUrl);
      // console.log("- New photo URL:", userInfoData.profilePhotoUrl);
      // console.log("- Final photo URL:", updatedData.profilePhotoUrl);
      await setDoc(userDocRef, updatedData, { merge: true });
      console.log("✅ User document updated successfully");
    }

    // Return user info for context updates
    return {
      token: await user.getIdToken(),
      userId: user.uid,
      userInfo: userInfoData,
    };
  } catch (error) {
    console.error("❌ Facebook sign-in completion failed:", error);

    // Enhanced error handling with debug info
    if (error.code === "auth/operation-not-allowed") {
      // Run debug check for Firebase configuration
      await debugFacebookAuth();
      const errorInfo = handleFacebookAuthError(error);
      throw new Error(
        `${errorInfo.title}: ${errorInfo.message}\n\nSolution:\n${errorInfo.solution}`
      );
    }

    // Handle other specific error cases
    if (error.code === "auth/account-exists-with-different-credential") {
      throw new Error(
        "An account already exists with the same email address but different sign-in credentials. Please use the original sign-in method."
      );
    } else if (error.code === "auth/invalid-credential") {
      throw new Error(
        "The Facebook credential is invalid or has expired. Please try again."
      );
    } else if (error.code === "auth/user-disabled") {
      throw new Error(
        "This user account has been disabled. Please contact support."
      );
    } else if (error.code === "auth/network-request-failed") {
      throw new Error(
        "Network error occurred. Please check your connection and try again."
      );
    } else if (error.message && error.message.includes("User cancelled")) {
      throw new Error("Facebook sign-in was cancelled");
    } else if (
      error.message?.includes("Component auth has not been registered yet")
    ) {
      throw new Error(
        "Authentication service is not ready. Please restart the app and try again."
      );
    }

    throw error;
  }
};

export const signInWithFacebook = async () => {
  try {
    console.log("🔑 Starting Facebook Sign-In process...");

    // Request Facebook login with required permissions
    const loginResult = await LoginManager.logInWithPermissions([
      "public_profile",
      "email",
    ]);

    if (loginResult.isCancelled) {
      throw new Error("User cancelled the Facebook login flow");
    }

    // Get access token
    const accessToken = await AccessToken.getCurrentAccessToken();
    if (!accessToken) {
      throw new Error("Failed to get Facebook access token");
    }

    console.log("✅ Facebook sign-in successful, getting user profile...");

    // Get user profile from Facebook Graph API with better error handling
    const userProfile = await new Promise((resolve, reject) => {
      try {
        const infoRequest = new GraphRequest(
          "/me",
          {
            accessToken: accessToken.accessToken,
            parameters: {
              fields: {
                string:
                  "id,name,email,picture.type(large),first_name,last_name",
              },
            },
          },
          (error, result) => {
            if (error) {
              console.error("Facebook Graph API error:", error);
              reject(
                new Error(`Facebook API Error: ${error.message || error}`)
              );
            } else if (result) {
              // console.log(
              //   "Facebook Graph API result:",
              //   JSON.stringify(result, null, 2)
              // );

              // Validate that we have the picture data
              if (result.picture?.data?.url) {
                // console.log(
                //   "✅ Facebook profile picture URL found:",
                //   result.picture.data.url
                // );
              } else {
                console.warn(
                  "⚠️ Facebook profile picture not found in API response"
                );
              }

              resolve(result);
            } else {
              reject(new Error("No result from Facebook Graph API"));
            }
          }
        );

        const manager = new GraphRequestManager();
        manager.addRequest(infoRequest);
        manager.start();
      } catch (err) {
        reject(
          new Error(`Failed to create Facebook Graph request: ${err.message}`)
        );
      }
    });

    console.log(
      "✅ Facebook user profile retrieved, authenticating with Firebase..."
    );

    // Get Firebase auth instance safely
    const auth = await getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase Auth is not available");
    }

    // Create Firebase credential with Facebook access token
    const facebookCredential = auth.FacebookAuthProvider.credential(
      accessToken.accessToken
    );

    // Sign in with Firebase using Facebook credential
    const userCredential = await auth().signInWithCredential(
      facebookCredential
    );
    const user = userCredential.user;

    console.log("✅ Firebase authentication successful");

    // Extract user information with better profile photo handling
    const profilePhotoUrl =
      userProfile.picture?.data?.url || user.photoURL || "";

    // console.log("📸 Facebook Profile Photo Debug:");
    // console.log(
    //   "- Full picture object:",
    //   JSON.stringify(userProfile.picture, null, 2)
    // );
    // console.log("- Extracted photo URL:", profilePhotoUrl);
    // console.log("- Firebase photoURL:", user.photoURL);

    const userInfoData = {
      uid: user.uid,
      email: user.email || userProfile.email || "",
      name: user.displayName || userProfile.name || "",
      profilePhotoUrl: profilePhotoUrl,
      emailVerified: user.emailVerified,
      provider: "facebook",
      facebookId: userProfile.id,
      createdAt: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    };

    // Get Firestore instance safely
    const db = await getFirebaseDB();
    if (!db) {
      console.warn("Firestore not available, skipping user document creation");
      return {
        token: await user.getIdToken(),
        userId: user.uid,
        userInfo: userInfoData,
      };
    }

    // Check if user exists in Firestore and create/update profile
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create new user document
      console.log("🆕 Creating new user document in Firestore...");
      await setDoc(userDocRef, userInfoData);
      console.log("✅ User document created successfully");
    } else {
      // Update existing user document with latest information
      console.log("🔄 Updating existing user document...");
      const existingData = userDoc.data();
      const updatedData = {
        ...existingData,
        name: userInfoData.name || existingData.name,
        // Always update profile photo from Facebook if available
        profilePhotoUrl:
          userInfoData.profilePhotoUrl || existingData.profilePhotoUrl,
        emailVerified: userInfoData.emailVerified,
        lastSignInTime: userInfoData.lastSignInTime,
        facebookId: userInfoData.facebookId,
      };

      // console.log("📸 Profile photo update debug:");
      // console.log("- Previous photo URL:", existingData.profilePhotoUrl);
      // console.log("- New photo URL:", userInfoData.profilePhotoUrl);
      // console.log("- Final photo URL:", updatedData.profilePhotoUrl);
      await setDoc(userDocRef, updatedData, { merge: true });
      console.log("✅ User document updated successfully");
    }

    // Return user info for context updates
    return {
      token: await user.getIdToken(),
      userId: user.uid,
      userInfo: userInfoData,
    };
  } catch (error) {
    console.error("❌ Facebook sign-in failed:", error);

    // Enhanced error handling with debug info
    if (error.code === "auth/operation-not-allowed") {
      // Run debug check for Firebase configuration
      await debugFacebookAuth();
      const errorInfo = handleFacebookAuthError(error);
      throw new Error(
        `${errorInfo.title}: ${errorInfo.message}\n\nSolution:\n${errorInfo.solution}`
      );
    }

    // Handle other specific error cases
    if (error.code === "auth/account-exists-with-different-credential") {
      throw new Error(
        "An account already exists with the same email address but different sign-in credentials. Please use the original sign-in method."
      );
    } else if (error.code === "auth/invalid-credential") {
      throw new Error(
        "The Facebook credential is invalid or has expired. Please try again."
      );
    } else if (error.code === "auth/user-disabled") {
      throw new Error(
        "This user account has been disabled. Please contact support."
      );
    } else if (error.code === "auth/network-request-failed") {
      throw new Error(
        "Network error occurred. Please check your connection and try again."
      );
    } else if (error.message && error.message.includes("User cancelled")) {
      throw new Error("Facebook sign-in was cancelled");
    } else if (
      error.message?.includes("Component auth has not been registered yet")
    ) {
      throw new Error(
        "Authentication service is not ready. Please restart the app and try again."
      );
    }

    throw error;
  }
};

/**
 * Check if user is currently signed in with Facebook
 */
export const isFacebookSignedIn = async () => {
  try {
    const accessToken = await AccessToken.getCurrentAccessToken();
    return !!accessToken;
  } catch (error) {
    console.error("Error checking Facebook sign-in status:", error);
    return false;
  }
};

/**
 * Get current Facebook user info
 */
export const getCurrentFacebookUser = async () => {
  try {
    const accessToken = await AccessToken.getCurrentAccessToken();
    if (!accessToken) {
      return null;
    }

    // Get user profile from Facebook Graph API with better error handling
    const userProfile = await new Promise((resolve, reject) => {
      try {
        const infoRequest = new GraphRequest(
          "/me",
          {
            accessToken: accessToken.accessToken,
            parameters: {
              fields: {
                string:
                  "id,name,email,picture.type(large),first_name,last_name",
              },
            },
          },
          (error, result) => {
            if (error) {
              console.error("Facebook Graph API error:", error);
              reject(
                new Error(`Facebook API Error: ${error.message || error}`)
              );
            } else if (result) {
              // console.log("Facebook Graph API result:", result);
              resolve(result);
            } else {
              reject(new Error("No result from Facebook Graph API"));
            }
          }
        );

        const manager = new GraphRequestManager();
        manager.addRequest(infoRequest);
        manager.start();
      } catch (err) {
        reject(
          new Error(`Failed to create Facebook Graph request: ${err.message}`)
        );
      }
    });

    return {
      accessToken: accessToken.accessToken,
      profile: userProfile,
    };
  } catch (error) {
    console.error("Error getting current Facebook user:", error);
    return null;
  }
};

/**
 * Apple Authentication Handler
 * Handles Apple sign-in and Firebase authentication integration
 */
export const signInWithApple = async () => {
  try {
    console.log("🍎 Starting Apple Sign-In process...");

    // Check if Apple Sign-In is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("Apple Sign-In is not available on this device");
    }

    // Request Apple sign-in
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential) {
      throw new Error("Apple sign-in failed: No credential received");
    }

    if (!credential.identityToken) {
      throw new Error("Apple sign-in failed: No identity token received");
    }

    console.log("✅ Apple sign-in successful, authenticating with Firebase...");

    // Get Firebase auth instance safely
    const auth = await getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase Auth is not available");
    }

    // Create Firebase credential with Apple identity token
    const appleCredential = auth.OAuthProvider.credential("apple.com", {
      idToken: credential.identityToken,
      rawNonce: credential.nonce, // optional: if you generate a nonce
    });

    // Sign in with Firebase using Apple credential
    const userCredential = await auth().signInWithCredential(appleCredential);
    const user = userCredential.user;

    console.log("✅ Firebase authentication successful");

    // Decode Apple identity token to get user info
    const decodedToken = jwtDecode(credential.identityToken);

    // Extract name information from Apple credential
    const fullName = credential.fullName || {};
    const displayName =
      fullName.givenName && fullName.familyName
        ? `${fullName.givenName} ${fullName.familyName}`.trim()
        : fullName.givenName || fullName.familyName || user.displayName || "";

    // Extract user information
    const userInfoData = {
      uid: user.uid,
      email: user.email || credential.email || decodedToken.email || "",
      name: displayName,
      firstName: fullName.givenName || "",
      lastName: fullName.familyName || "",
      profilePhotoUrl: user.photoURL || "", // Apple doesn't provide profile photos
      emailVerified: user.emailVerified || decodedToken.email_verified || false,
      provider: "apple",
      appleId: decodedToken.sub || credential.user,
      realUserStatus: credential.realUserStatus || 0,
      authorizationCode: credential.authorizationCode,
      createdAt: new Date().toISOString(),
      lastSignInAt: new Date().toISOString(),
    };

    // Save/update user info in Firestore
    const db = getFirebaseDB();
    if (db) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const existingUser = await getDoc(userDocRef);

        if (existingUser.exists()) {
          // Update existing user with latest Apple info
          const existingData = existingUser.data();
          const updatedData = {
            ...existingData,
            ...userInfoData,
            lastSignInAt: new Date().toISOString(),
            // Preserve existing data if Apple doesn't provide it
            name: userInfoData.name || existingData.name,
            email: userInfoData.email || existingData.email,
            profilePhotoUrl:
              existingData.profilePhotoUrl || userInfoData.profilePhotoUrl,
          };
          await setDoc(userDocRef, updatedData, { merge: true });
          console.log("✅ Updated existing user profile in Firestore");
        } else {
          // Create new user profile
          await setDoc(userDocRef, userInfoData);
          console.log("✅ Created new user profile in Firestore");
        }
      } catch (firestoreError) {
        console.error("❌ Firestore operation failed:", firestoreError);
        // Continue even if Firestore fails
      }
    }

    return {
      token: await user.getIdToken(),
      userId: user.uid,
      userInfo: userInfoData,
    };
  } catch (error) {
    console.error("❌ Apple sign-in failed:", error);

    // Enhanced error handling
    if (error.code === "auth/operation-not-allowed") {
      throw new Error(
        "Apple Sign-In is not enabled in Firebase. Please enable it in the Firebase Console."
      );
    } else if (error.code === "auth/account-exists-with-different-credential") {
      throw new Error(
        "An account already exists with the same email address but different sign-in credentials. Please use the original sign-in method."
      );
    } else if (error.code === "auth/invalid-credential") {
      throw new Error(
        "The Apple credential is invalid or has expired. Please try again."
      );
    } else if (error.code === "auth/user-disabled") {
      throw new Error(
        "This user account has been disabled. Please contact support."
      );
    } else if (error.code === "auth/network-request-failed") {
      throw new Error(
        "Network error occurred. Please check your connection and try again."
      );
    } else if (error.message && error.message.includes("cancelled")) {
      throw new Error("Apple sign-in was cancelled");
    } else if (error.message && error.message.includes("not available")) {
      throw new Error("Apple Sign-In is not available on this device");
    } else if (
      error.message?.includes("Component auth has not been registered yet")
    ) {
      throw new Error(
        "Authentication service is not ready. Please restart the app and try again."
      );
    }

    throw error;
  }
};

/**
 * Handle Apple authentication when Apple login is already completed
 * (e.g., when using the Apple Sign-In button directly)
 */
export const completeAppleSignIn = async (appleCredential) => {
  try {
    console.log("🍎 Completing Apple Sign-In with existing credential...");

    if (!appleCredential) {
      throw new Error("No Apple credential provided for sign-in completion");
    }

    if (!appleCredential.identityToken) {
      throw new Error("Apple credential missing identity token");
    }

    console.log(
      "✅ Apple credential received, authenticating with Firebase..."
    );

    // Get Firebase auth instance safely
    const auth = await getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase Auth is not available");
    }

    // Create Firebase credential with Apple identity token
    const firebaseCredential = auth.OAuthProvider.credential("apple.com", {
      idToken: appleCredential.identityToken,
      rawNonce: appleCredential.nonce,
    });

    // Sign in with Firebase using Apple credential
    const userCredential = await auth().signInWithCredential(
      firebaseCredential
    );
    const user = userCredential.user;

    console.log("✅ Firebase authentication successful");

    // Decode Apple identity token to get user info
    const decodedToken = jwtDecode(appleCredential.identityToken);

    // Extract name information from Apple credential
    const fullName = appleCredential.fullName || {};
    const displayName =
      fullName.givenName && fullName.familyName
        ? `${fullName.givenName} ${fullName.familyName}`.trim()
        : fullName.givenName || fullName.familyName || user.displayName || "";

    // Extract user information with better data handling
    const userInfoData = {
      uid: user.uid,
      email: user.email || appleCredential.email || decodedToken.email || "",
      name: displayName,
      firstName: fullName.givenName || "",
      lastName: fullName.familyName || "",
      profilePhotoUrl: user.photoURL || "", // Apple doesn't provide profile photos
      emailVerified: user.emailVerified || decodedToken.email_verified || false,
      provider: "apple",
      appleId: decodedToken.sub || appleCredential.user,
      realUserStatus: appleCredential.realUserStatus || 0,
      authorizationCode: appleCredential.authorizationCode,
      createdAt: new Date().toISOString(),
      lastSignInAt: new Date().toISOString(),
    };

    // Save/update user info in Firestore
    const db = getFirebaseDB();
    if (db) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const existingUser = await getDoc(userDocRef);

        if (existingUser.exists()) {
          // Update existing user with latest Apple info
          const existingData = existingUser.data();
          const updatedData = {
            ...existingData,
            ...userInfoData,
            lastSignInAt: new Date().toISOString(),
            // Preserve existing data if Apple doesn't provide it
            name: userInfoData.name || existingData.name,
            email: userInfoData.email || existingData.email,
            profilePhotoUrl:
              existingData.profilePhotoUrl || userInfoData.profilePhotoUrl,
          };
          await setDoc(userDocRef, updatedData, { merge: true });
          console.log("✅ Updated existing user profile in Firestore");
        } else {
          // Create new user profile
          await setDoc(userDocRef, userInfoData);
          console.log("✅ Created new user profile in Firestore");
        }
      } catch (firestoreError) {
        console.error("❌ Firestore operation failed:", firestoreError);
        // Continue even if Firestore fails
      }
    }

    return {
      token: await user.getIdToken(),
      userId: user.uid,
      userInfo: userInfoData,
    };
  } catch (error) {
    console.error("❌ Apple sign-in completion failed:", error);

    // Enhanced error handling
    if (error.code === "auth/operation-not-allowed") {
      throw new Error(
        "Apple Sign-In is not enabled in Firebase. Please enable it in the Firebase Console."
      );
    } else if (error.code === "auth/account-exists-with-different-credential") {
      throw new Error(
        "An account already exists with the same email address but different sign-in credentials. Please use the original sign-in method."
      );
    } else if (error.code === "auth/invalid-credential") {
      throw new Error(
        "The Apple credential is invalid or has expired. Please try again."
      );
    } else if (error.code === "auth/user-disabled") {
      throw new Error(
        "This user account has been disabled. Please contact support."
      );
    } else if (error.code === "auth/network-request-failed") {
      throw new Error(
        "Network error occurred. Please check your connection and try again."
      );
    }

    throw error;
  }
};

export const signOutFromFacebook = async () => {
  try {
    console.log("🔓 Signing out from Facebook...");

    // Get Firebase auth instance safely
    const auth = await getFirebaseAuth();

    // Sign out from Firebase
    if (auth && auth.currentUser) {
      await auth.signOut();
      console.log("✅ Firebase sign-out successful");
    }

    // Sign out from Facebook
    await LoginManager.logOut();
    console.log("✅ Facebook sign-out successful");

    return true;
  } catch (error) {
    console.error("❌ Facebook sign-out failed:", error);
    throw error;
  }
};

export const signOutFromApple = async () => {
  try {
    console.log("🔓 Signing out from Apple...");

    // Get Firebase auth instance safely
    const auth = await getFirebaseAuth();

    // Sign out from Firebase
    if (auth && auth.currentUser) {
      await auth.signOut();
      console.log("✅ Firebase sign-out successful");
    }

    // Apple doesn't have an explicit sign-out like Google/Facebook
    // The user would need to revoke access through their Apple ID settings
    // We just clear any stored credentials locally
    try {
      const { clearAppleCredentials } = await import(
        "../components/Auth/providers/Apple/utils/appleAuthUtils"
      );
      await clearAppleCredentials();
      console.log("✅ Apple credentials cleared");
    } catch (importError) {
      console.log(
        "Note: Apple credentials clearing not available:",
        importError.message
      );
    }

    console.log("✅ Apple sign-out successful");
    return true;
  } catch (error) {
    console.error("❌ Apple sign-out failed:", error);
    throw error;
  }
};
