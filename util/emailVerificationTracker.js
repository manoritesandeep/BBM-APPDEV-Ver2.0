import AsyncStorage from "@react-native-async-storage/async-storage";

const EMAIL_ATTEMPT_KEY = "email_verification_attempts";
const FIREBASE_RATE_LIMIT_DURATION = 3600000; // 1 hour in milliseconds (Firebase blocks for 1+ hours)
const APP_RATE_LIMIT_DURATION = 300000; // 5 minutes between attempts (more reasonable)
const MAX_ATTEMPTS_PER_HOUR = 3; // Conservative limit to avoid Firebase blocks

/**
 * Email Verification Attempt Tracker
 * Manages both Firebase rate limiting and app-level rate limiting
 */
export class EmailVerificationTracker {
  static async getAttemptData() {
    try {
      const data = await AsyncStorage.getItem(EMAIL_ATTEMPT_KEY);
      return data
        ? JSON.parse(data)
        : { attempts: [], lastFirebaseBlock: null };
    } catch (error) {
      console.error("Failed to get attempt data:", error);
      return { attempts: [], lastFirebaseBlock: null };
    }
  }

  static async saveAttemptData(data) {
    try {
      await AsyncStorage.setItem(EMAIL_ATTEMPT_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save attempt data:", error);
    }
  }

  static async recordAttempt() {
    const data = await this.getAttemptData();
    const now = Date.now();

    // Add current attempt
    data.attempts.push(now);

    // Remove attempts older than 1 hour
    data.attempts = data.attempts.filter(
      (timestamp) => now - timestamp < FIREBASE_RATE_LIMIT_DURATION
    );

    // Check if we're approaching Firebase limits (more than 3 attempts in an hour)
    if (data.attempts.length >= MAX_ATTEMPTS_PER_HOUR) {
      return {
        canSend: false,
        reason: "approaching_limit",
        timeRemaining: FIREBASE_RATE_LIMIT_DURATION - (now - data.attempts[0]),
      };
    }

    await this.saveAttemptData(data);
  }

  static async recordFirebaseBlock() {
    const data = await this.getAttemptData();
    data.lastFirebaseBlock = Date.now();
    await this.saveAttemptData(data);
  }

  static async canSendEmail() {
    const data = await this.getAttemptData();
    const now = Date.now();

    // Check if Firebase blocked us recently
    if (data.lastFirebaseBlock) {
      const timeSinceBlock = now - data.lastFirebaseBlock;
      if (timeSinceBlock < FIREBASE_RATE_LIMIT_DURATION) {
        return {
          canSend: false,
          reason: "firebase_block",
          timeRemaining: FIREBASE_RATE_LIMIT_DURATION - timeSinceBlock,
        };
      }
    }

    // Check app-level rate limiting (last attempt)
    const recentAttempts = data.attempts.filter(
      (timestamp) => now - timestamp < APP_RATE_LIMIT_DURATION
    );

    if (recentAttempts.length > 0) {
      const lastAttempt = Math.max(...recentAttempts);
      const timeRemaining = APP_RATE_LIMIT_DURATION - (now - lastAttempt);
      if (timeRemaining > 0) {
        return {
          canSend: false,
          reason: "app_rate_limit",
          timeRemaining,
        };
      }
    }

    return { canSend: true };
  }

  static async getTimeUntilNextAttempt() {
    const status = await this.canSendEmail();
    if (status.canSend) return 0;
    return Math.ceil(status.timeRemaining / 1000); // Return seconds
  }

  static async clearBlocks() {
    await AsyncStorage.removeItem(EMAIL_ATTEMPT_KEY);
  }

  static formatTimeRemaining(seconds) {
    if (seconds <= 0) return "0s";

    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    } else if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
