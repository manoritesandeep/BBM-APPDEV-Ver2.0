import { sendEmailVerification, getAuth } from "@react-native-firebase/auth";
import { doc, updateDoc, getDoc } from "@react-native-firebase/firestore";
import { getFirebaseDB } from "../../../../../util/firebaseConfig";

/**
 * Email verification service for phone auth users who add email addresses
 */
export class PhoneUserEmailService {
  /**
   * Send email verification to phone auth user who added email
   * @param {string} userId - User ID
   * @param {string} email - Email address to verify
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async sendEmailVerificationToPhoneUser(userId, email) {
    try {
      console.log("📧 Sending email verification to phone user:", email);

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Update Firebase Auth user with email if not already set
      if (!user.email || user.email !== email) {
        await user.updateEmail(email);
      }

      // Send verification email
      await sendEmailVerification(user);

      // Update Firestore user document
      const db = await getFirebaseDB();
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        emailVerificationSent: true,
        emailVerificationSentAt: new Date().toISOString(),
      });

      console.log("✅ Email verification sent successfully");
      return {
        success: true,
        message: "Verification email sent! Please check your inbox.",
      };
    } catch (error) {
      console.error("❌ Error sending email verification:", error);
      return {
        success: false,
        message: error.message || "Failed to send verification email",
      };
    }
  }

  /**
   * Check and update email verification status for phone user
   * @param {string} userId - User ID
   * @returns {Promise<{isVerified: boolean, updated: boolean}>}
   */
  static async checkEmailVerificationStatus(userId) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        return { isVerified: false, updated: false };
      }

      // Reload user to get latest verification status
      await user.reload();
      const isVerified = user.emailVerified;

      if (isVerified) {
        // Update Firestore if newly verified
        const db = await getFirebaseDB();
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && !userDoc.data().emailVerified) {
          await updateDoc(userRef, {
            emailVerified: true,
            emailVerifiedAt: new Date().toISOString(),
          });
          console.log("✅ Email verification status updated in Firestore");
          return { isVerified: true, updated: true };
        }
      }

      return { isVerified, updated: false };
    } catch (error) {
      console.error("❌ Error checking email verification:", error);
      return { isVerified: false, updated: false };
    }
  }

  /**
   * Get user's communication preferences based on available channels
   * @param {Object} user - User object
   * @returns {Object} Communication preferences
   */
  static getCommunicationPreferences(user) {
    const hasPhone = user.phoneNumber && user.phoneVerified;
    const hasEmail = user.email && user.email.trim() !== "";
    const emailVerified = user.emailVerified;

    return {
      canReceiveWhatsApp: hasPhone,
      canReceiveEmail: hasEmail && emailVerified,
      canReceiveSMS: hasPhone,
      preferredChannel: emailVerified
        ? "email"
        : hasPhone
        ? "whatsapp"
        : "none",
      availableChannels: [
        ...(hasPhone ? ["whatsapp", "sms"] : []),
        ...(hasEmail && emailVerified ? ["email"] : []),
      ],
    };
  }

  /**
   * Determine if user needs email for order communications
   * @param {Object} user - User object
   * @returns {boolean} Whether user needs email
   */
  static doesUserNeedEmail(user) {
    const hasPhone = user.phoneNumber && user.phoneVerified;
    const hasVerifiedEmail = user.email && user.emailVerified;

    // Users with verified phone don't need email (can use WhatsApp)
    // But email is still beneficial for better communication options
    return !hasPhone && !hasVerifiedEmail;
  }

  /**
   * Check if user can place orders without email verification
   * @param {Object} user - User object
   * @returns {boolean} Whether user can place orders
   */
  static canPlaceOrders(user) {
    const hasPhone = user.phoneNumber && user.phoneVerified;
    const hasVerifiedEmail = user.email && user.emailVerified;

    // Users can place orders if they have either verified phone OR verified email
    return hasPhone || hasVerifiedEmail;
  }
}

export default PhoneUserEmailService;
