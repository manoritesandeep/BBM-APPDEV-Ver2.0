import axios from "axios";
import {
  FIREBASE_API_KEY,
  EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_IDENTITY_URL,
  EXPO_PUBLIC_SECURETOKEN_URL,
} from "@env";
import { getFirebaseDB, getFirebaseAuth } from "./firebaseConfig";
import { doc, setDoc, updateDoc } from "@react-native-firebase/firestore";
// import {
//   sendEmailVerification as firebaseSendEmailVerification,
//   reload,
// } from "firebase/auth";
import { testFirebaseConfig } from "./firebaseDebug";
import { EmailVerificationTracker } from "./emailVerificationTracker";
import { EmailService, EmailTemplates } from "../components/Email";

// Provide env-configurable base URLs with sensible defaults
const IDENTITY_BASE =
  EXPO_PUBLIC_IDENTITY_URL || "https://identitytoolkit.googleapis.com/v1";
const SECURETOKEN_BASE =
  EXPO_PUBLIC_SECURETOKEN_URL || "https://securetoken.googleapis.com/v1";

const API_KEY = FIREBASE_API_KEY;

// Test Firebase configuration on module load
testFirebaseConfig();

async function authenticate(mode, email, password) {
  const url = `${EXPO_PUBLIC_API_URL}:${mode}?key=${API_KEY}`;
  // // const url = `${IDENTITY_BASE}/${mode}?key=${API_KEY}`;
  const response = await axios.post(url, {
    email,
    password,
    returnSecureToken: true,
  });
  const token = response.data.idToken;
  const userId = response.data.localId;
  const refreshToken = response.data.refreshToken;
  return { token, userId, refreshToken };
}

export async function createUser(email, password, name = "", addresses = "") {
  const { token, userId, refreshToken } = await authenticate(
    "signUp",
    email,
    password
  );

  // Send email verification immediately after signup using fresh token (skip rate limit for initial signup)
  try {
    await sendEmailVerification(token, true); // skipRateLimit = true for initial signup
    console.log("✅ Verification email sent successfully during signup");
  } catch (emailError) {
    console.warn(
      "⚠️ Failed to send verification email during signup:",
      emailError
    );
    // Don't fail the signup process if email sending fails
  }

  // Save user profile in Firestore with verification status
  try {
    const db = await getFirebaseDB();
    if (db) {
      await setDoc(doc(db, "users", userId), {
        name,
        email,
        addresses,
        emailVerified: false,
        verificationEmailSent: true,
        createdAt: new Date().toISOString(),
      });
    } else {
      console.warn("Database not available, skipping user profile creation");
    }
  } catch (dbError) {
    console.warn("Failed to create user profile in Firestore:", dbError);
    // Continue without profile creation to avoid auth failure
  }

  // Send welcome email after successful account creation
  try {
    const emailData = {
      to: [email],
      message: {
        subject: `Welcome to Build Bharat Mart, ${name}! 🎉`,
        html: EmailTemplates.welcomeTemplate(name || "Valued Customer"),
        text: `Welcome ${name}! Welcome to Build Bharat Mart - Building Your Dreams, One Tool at a Time! We're excited to have you join our community of builders, contractors, and DIY enthusiasts.`,
      },
      template: {
        type: "welcome",
        version: "1.0",
        data: { name, email },
      },
      metadata: {
        userId,
        emailType: "welcome",
        userName: name,
        triggeredBy: "user_signup",
      },
    };

    const welcomeResult = await EmailService.sendEmail(emailData);

    if (welcomeResult.success) {
      console.log(`✅ Welcome email sent to ${name} (${email})`);
    } else {
      console.error(`❌ Failed to send welcome email: ${welcomeResult.error}`);
    }
  } catch (welcomeEmailError) {
    console.error("❌ Welcome email error:", welcomeEmailError);
    // Don't fail signup if welcome email fails
  }

  return { token, userId, refreshToken };
}

export function login(email, password) {
  return authenticate("signInWithPassword", email, password);
}

// Send password reset email using Firebase REST API
export async function sendPasswordResetEmail(email) {
  const url = `${IDENTITY_BASE}/accounts:sendOobCode?key=${API_KEY}`;

  if (!email) {
    throw new Error("Email address is required for password reset.");
  }

  if (!email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  try {
    const requestData = {
      requestType: "PASSWORD_RESET",
      email: email,
    };

    console.log("📤 Sending password reset email to:", email);

    const response = await axios.post(url, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 second timeout
    });

    console.log("✅ Password reset email sent successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error.message);

    if (error.response?.data?.error?.message) {
      const firebaseError = error.response.data.error.message;
      console.error("🔥 Firebase error:", firebaseError);

      if (firebaseError.includes("EMAIL_NOT_FOUND")) {
        throw new Error(
          "No account found with this email address. Please check your email or create a new account."
        );
      } else if (firebaseError.includes("TOO_MANY_ATTEMPTS_TRY_LATER")) {
        throw new Error(
          "Too many password reset attempts. Please wait a few minutes before trying again."
        );
      } else if (firebaseError.includes("INVALID_EMAIL")) {
        throw new Error("Please enter a valid email address.");
      } else {
        throw new Error(`Password reset failed: ${firebaseError}`);
      }
    }

    // Handle network or timeout errors
    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Request timed out. Please check your internet connection and try again."
      );
    }

    throw new Error("Failed to send password reset email. Please try again.");
  }
}

// Refresh token function
export async function refreshToken(refreshToken) {
  const url = `${SECURETOKEN_BASE}/token?key=${API_KEY}`;
  // const url = `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`;

  try {
    const response = await axios.post(url, {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    return {
      token: response.data.access_token,
      refreshToken: response.data.refresh_token,
    };
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw new Error("Failed to refresh token");
  }
}

// Send email verification using REST API (compatible with REST auth)
export async function sendEmailVerification(idToken, skipRateLimit = false) {
  const url = `${IDENTITY_BASE}/accounts:sendOobCode?key=${API_KEY}`;
  // const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`;

  // console.log("🔍 Attempting to send verification email...");
  // console.log("Token length:", idToken?.length);
  // console.log("API_KEY configured:", !!API_KEY);
  // console.log("Skip rate limit:", skipRateLimit);

  if (!idToken) {
    throw new Error("No authentication token provided. Please log in again.");
  }

  // Check rate limiting unless this is initial signup
  if (!skipRateLimit) {
    const canSendStatus = await EmailVerificationTracker.canSendEmail();
    if (!canSendStatus.canSend) {
      const timeRemaining = Math.ceil(canSendStatus.timeRemaining / 1000);
      const formattedTime =
        EmailVerificationTracker.formatTimeRemaining(timeRemaining);

      if (canSendStatus.reason === "firebase_block") {
        throw new Error(
          `We've reached the email sending limit. Please check your inbox and spam folder, then wait ${formattedTime} before requesting another verification email.`
        );
      } else if (canSendStatus.reason === "approaching_limit") {
        throw new Error(
          `You've requested several verification emails recently. To avoid hitting limits, please wait ${formattedTime} before trying again. Check your email inbox and spam folder in the meantime.`
        );
      } else {
        throw new Error(
          `Please wait ${formattedTime} before sending another verification email.`
        );
      }
    }
  }

  try {
    const requestData = {
      requestType: "VERIFY_EMAIL",
      idToken: idToken,
    };

    // console.log(
    //   "📤 Request URL:",
    //   "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=***"
    // );
    // console.log("📤 Request data:", { ...requestData, idToken: "***" });

    // Record attempt before sending
    if (!skipRateLimit) {
      await EmailVerificationTracker.recordAttempt();
    }

    const response = await axios.post(url, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 second timeout
    });

    // console.log("✅ Email verification sent successfully via REST API");
    console.log("📥 Response status:", response.status);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to send verification email:", error.message);

    if (error.response) {
      console.error("📥 Response status:", error.response.status);
      console.error("📥 Response data:", error.response.data);
      console.error("📥 Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("📡 No response received:", error.request);
    } else {
      console.error("⚙️ Request setup error:", error.message);
    }

    // Handle specific Firebase Auth errors
    if (error.response?.data?.error?.message) {
      const firebaseError = error.response.data.error.message;
      console.error("🔥 Firebase error:", firebaseError);

      if (firebaseError.includes("TOO_MANY_ATTEMPTS_TRY_LATER")) {
        // Record Firebase block
        await EmailVerificationTracker.recordFirebaseBlock();

        // Firebase blocks for 1+ hours, provide helpful message
        throw new Error(
          "We've sent you several verification emails already. To prevent spam, Firebase has temporarily limited email sending. Please:\n\n• Check your email inbox and spam folder\n• Wait about 1 hour before requesting another email\n• Contact support if you still need help\n\nSorry for the inconvenience!"
        );
      } else if (firebaseError.includes("INVALID_ID_TOKEN")) {
        throw new Error("Your session has expired. Please log in again.");
      } else if (firebaseError.includes("EMAIL_NOT_FOUND")) {
        throw new Error("Email address not found.");
      } else if (firebaseError.includes("USER_DISABLED")) {
        throw new Error("User account has been disabled.");
      } else if (firebaseError.includes("EXPIRED_OOB_CODE")) {
        throw new Error("The verification code has expired.");
      } else {
        throw new Error(`Verification failed: ${firebaseError}`);
      }
    }

    // Handle network or timeout errors
    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Request timed out. Please check your internet connection."
      );
    }

    throw new Error("Failed to send verification email. Please try again.");
  }
}

// Resend email verification with enhanced rate limiting and user feedback
export async function resendEmailVerification(
  idToken,
  refreshTokenParam = null
) {
  // Check if we can send email
  const canSendStatus = await EmailVerificationTracker.canSendEmail();
  if (!canSendStatus.canSend) {
    const timeRemaining = Math.ceil(canSendStatus.timeRemaining / 1000);
    const formattedTime =
      EmailVerificationTracker.formatTimeRemaining(timeRemaining);

    if (canSendStatus.reason === "firebase_block") {
      throw new Error(
        `We've reached the email sending limit. Please check your inbox and spam folder, then wait ${formattedTime} before requesting another verification email.`
      );
    } else if (canSendStatus.reason === "approaching_limit") {
      throw new Error(
        `You've requested several verification emails recently. To avoid hitting limits, please wait ${formattedTime} before trying again. Check your email inbox and spam folder in the meantime.`
      );
    } else {
      throw new Error(
        `Please wait ${formattedTime} before sending another verification email.`
      );
    }
  }

  try {
    return await sendEmailVerification(idToken, false); // Don't skip rate limit for resends
  } catch (error) {
    // If token is invalid and we have a refresh token, try refreshing
    if (error.message.includes("session has expired") && refreshTokenParam) {
      console.log("🔄 Token expired, attempting to refresh...");
      try {
        const refreshedAuth = await refreshToken(refreshTokenParam);
        console.log("✅ Token refreshed successfully");
        return await sendEmailVerification(refreshedAuth.token, false);
      } catch (refreshError) {
        console.error("❌ Failed to refresh token:", refreshError);
        throw new Error("Your session has expired. Please log in again.");
      }
    }
    throw error;
  }
}

// Get current rate limit status for UI
export async function getEmailVerificationStatus() {
  const canSendStatus = await EmailVerificationTracker.canSendEmail();
  const timeUntilNext =
    await EmailVerificationTracker.getTimeUntilNextAttempt();

  return {
    canSend: canSendStatus.canSend,
    timeRemaining: timeUntilNext,
    formattedTime: EmailVerificationTracker.formatTimeRemaining(timeUntilNext),
    reason: canSendStatus.reason || null,
  };
}

// Debug function to clear rate limiting (for development/testing)
export async function clearEmailVerificationBlocks() {
  await EmailVerificationTracker.clearBlocks();
  console.log("🔧 Email verification rate limits cleared");
}

// Check email verification status using REST API
export async function checkEmailVerification(idToken) {
  const url = `${IDENTITY_BASE}/accounts:lookup?key=${API_KEY}`;
  // const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`;

  try {
    const response = await axios.post(url, {
      idToken: idToken,
    });

    const userData = response.data.users[0];
    return {
      emailVerified: userData.emailVerified || false,
      email: userData.email,
    };
  } catch (error) {
    console.error("Failed to check verification status:", error);
    throw new Error("Failed to check verification status");
  }
}

// Update user verification status in Firestore
export async function updateUserVerificationStatus(userId, emailVerified) {
  try {
    const db = await getFirebaseDB();
    if (db) {
      await updateDoc(doc(db, "users", userId), {
        emailVerified: emailVerified,
        verifiedAt: emailVerified ? new Date().toISOString() : null,
      });
    }
  } catch (error) {
    console.warn("Failed to update verification status in Firestore:", error);
  }
}
