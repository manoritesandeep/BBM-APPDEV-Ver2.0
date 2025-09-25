import { useState, useContext } from "react";
import { Alert } from "react-native";
import auth from "@react-native-firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "@react-native-firebase/firestore";
import { getFirebaseDB } from "../../../../../util/firebaseConfig";
import { AuthContext } from "../../../../../store/auth-context";
import { UserContext } from "../../../../../store/user-context";
import { generateUniqueId } from "../../../../../util/dataFormat";
import {
  validatePhoneNumber as validatePhone,
  formatPhoneNumber as formatPhone,
} from "../utils/phoneUtils";

/**
 * Phone Authentication Hook
 * Handles phone number verification and Firebase integration
 * Provides seamless registration and login functionality
 */
export function usePhoneAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  // Use utility functions for validation and formatting
  const validatePhoneNumber = validatePhone;
  const formatPhoneNumber = formatPhone;

  // Send OTP to phone number
  const sendVerificationCode = async (phoneNumber) => {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!validatePhoneNumber(formattedPhone)) {
      throw new Error(
        "Please enter a valid phone number with country code (e.g., +1234567890)"
      );
    }

    setIsLoading(true);
    setVerificationInProgress(true);

    try {
      console.log("📱 Sending verification code to:", formattedPhone);
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      setConfirmationResult(confirmation);
      console.log("✅ Verification code sent successfully");
      return { success: true, message: "Verification code sent to your phone" };
    } catch (error) {
      console.error("❌ Error sending verification code:", error);
      setVerificationInProgress(false);

      let errorMessage = "Failed to send verification code";

      switch (error.code) {
        case "auth/invalid-phone-number":
          errorMessage = "Invalid phone number format";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many requests. Please try again later";
          break;
        case "auth/quota-exceeded":
          errorMessage = "SMS quota exceeded. Please try again tomorrow";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP and handle authentication
  const verifyCode = async (
    verificationCode,
    isSignUp = false,
    additionalData = {}
  ) => {
    if (!confirmationResult) {
      throw new Error("No verification process in progress");
    }

    if (!verificationCode || verificationCode.length < 6) {
      throw new Error("Please enter the complete verification code");
    }

    setIsLoading(true);

    try {
      console.log("🔐 Verifying code...");
      const userCredential = await confirmationResult.confirm(verificationCode);
      const firebaseUser = userCredential.user;

      console.log("✅ Phone verification successful");

      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();
      const userId = firebaseUser.uid;
      const phoneNumber = firebaseUser.phoneNumber;

      // Check if user exists in Firestore
      const db = await getFirebaseDB();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      let userData;

      if (userDoc.exists()) {
        // Existing user - login
        userData = userDoc.data();
        console.log("👤 Existing user logged in");

        // Update last login timestamp and ensure phone number is current
        const updateData = {
          lastLoginAt: new Date().toISOString(),
          phoneNumber: phoneNumber, // Ensure phone number is up to date
          phoneVerified: true, // Always true for phone auth users
        };

        // If user doesn't have authProvider set or it's different, update it
        if (!userData.authProvider || userData.authProvider !== "phone") {
          updateData.authProvider = "phone";
        }

        await updateDoc(userDocRef, updateData);

        // Update userData to reflect the changes
        userData = { ...userData, ...updateData };
        console.log("✅ User profile synced with phone number:", phoneNumber);
      } else {
        // New user - registration (Firebase Phone Auth creates user automatically)
        console.log("👤 Creating new user account");

        // Create new user profile
        const newUserData = {
          userId: userId,
          phoneNumber: phoneNumber,
          displayName: additionalData.name || `User ${phoneNumber.slice(-4)}`,
          email: additionalData.email || "", // Empty by default for phone sign-ups
          address: additionalData.address || "",
          profilePhotoUrl: "",
          authProvider: "phone",
          phoneVerified: true,
          emailVerified: false, // Will be false until email is added and verified
          emailOptional: true, // Flag indicating email is optional for this user
          canAddEmail: true, // Flag indicating user can add email address
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          preferences: {
            notifications: true,
            language: "en",
            theme: "light",
            communicationChannel: "phone", // Preferred communication channel
          },
          // Generate unique user ID for internal use
          internalUserId: generateUniqueId(),
        };

        await setDoc(userDocRef, newUserData);
        userData = newUserData;
        console.log("✅ New user profile created");
      }

      // Set authentication context
      authCtx.authenticate(token, userId, "phone");

      // Set user context
      userCtx.setUser(userData);

      // Reset verification state
      setConfirmationResult(null);
      setVerificationInProgress(false);

      return {
        success: true,
        isNewUser: !userDoc.exists(),
        userData,
        message: userDoc.exists()
          ? "Welcome back!"
          : "Account created successfully!",
      };
    } catch (error) {
      console.error("❌ Error verifying code:", error);

      let errorMessage = "Invalid verification code";

      switch (error.code) {
        case "auth/invalid-verification-code":
          errorMessage = "Invalid verification code. Please try again";
          break;
        case "auth/code-expired":
          errorMessage =
            "Verification code has expired. Please request a new one";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection";
          break;
        default:
          if (error.message.includes("No account found")) {
            errorMessage = error.message;
          } else {
            errorMessage = error.message || errorMessage;
          }
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const resendVerificationCode = async (phoneNumber) => {
    try {
      // Reset current confirmation
      setConfirmationResult(null);
      setVerificationInProgress(false);

      // Send new code
      return await sendVerificationCode(phoneNumber);
    } catch (error) {
      throw error;
    }
  };

  // Reset authentication flow
  const resetPhoneAuth = () => {
    setConfirmationResult(null);
    setVerificationInProgress(false);
    setIsLoading(false);
  };

  return {
    isLoading,
    verificationInProgress,
    sendVerificationCode,
    verifyCode,
    resendVerificationCode,
    resetPhoneAuth,
    validatePhoneNumber,
    formatPhoneNumber,
  };
}
