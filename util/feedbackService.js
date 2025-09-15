import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "@react-native-firebase/firestore";
import { db } from "./firebaseConfig";
import { Platform } from "react-native";

// Optional imports - graceful fallback if packages not available
let Device;
let Constants;
try {
  Device = require("expo-device");
  Constants = require("expo-constants");
} catch (error) {
  console.warn(
    "expo-device or expo-constants not available, using fallback values"
  );
}

/**
 * Feedback Service
 *
 * Handles all feedback-related operations with Firestore backend
 * Matches the existing customer_feedback collection structure
 */

/**
 * Get device information for feedback tracking
 */
const getDeviceInfo = () => {
  return {
    platform: Platform.OS,
    model: Device?.modelName || "Unknown",
    version: Platform.Version?.toString() || "Unknown",
    brand: Device?.brand || "Unknown",
  };
};

/**
 * Get app version information
 */
/**
 * Get app version information
 */
const getAppVersion = () => {
  return (
    Constants?.expoConfig?.version || Constants?.manifest?.version || "1.0.0"
  );
};

/**
 * Generate keywords from feedback text for better searchability
 */
const generateKeywords = (comment, tags, category) => {
  const keywords = [];

  // Add category
  if (category) keywords.push(category.toLowerCase());

  // Add tags
  if (tags && tags.length > 0) {
    keywords.push(...tags);
  }

  // Extract keywords from comment
  if (comment) {
    const words = comment
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3) // Only words longer than 3 characters
      .slice(0, 10); // Limit to first 10 words
    keywords.push(...words);
  }

  return [...new Set(keywords)]; // Remove duplicates
};

/**
 * Determine sentiment based on rating and tags
 */
const calculateSentiment = (overallRating, tags = []) => {
  const negativeKeywords = [
    "poor",
    "bad",
    "terrible",
    "awful",
    "hate",
    "broken",
    "delayed",
    "damaged",
  ];
  const positiveKeywords = [
    "excellent",
    "great",
    "amazing",
    "love",
    "perfect",
    "fast",
    "good",
  ];

  // Check tags for sentiment indicators
  const hasNegativeTags = tags.some((tag) =>
    negativeKeywords.some((keyword) => tag.toLowerCase().includes(keyword))
  );
  const hasPositiveTags = tags.some((tag) =>
    positiveKeywords.some((keyword) => tag.toLowerCase().includes(keyword))
  );

  if (overallRating >= 4 && !hasNegativeTags) return "positive";
  if (overallRating <= 2 || hasNegativeTags) return "negative";
  return "neutral";
};

/**
 * Calculate priority based on rating, tags, and user history
 */
const calculatePriority = (overallRating, tags = [], severity = "low") => {
  // Higher priority for lower ratings
  if (overallRating <= 2) return 3; // High priority
  if (overallRating === 3) return 2; // Medium priority

  // Check for urgent tags
  const urgentTags = [
    "damaged_item",
    "poor_quality",
    "app_crash",
    "payment_issue",
  ];
  if (tags.some((tag) => urgentTags.includes(tag))) return 3;

  // Check severity
  if (severity === "high") return 3;
  if (severity === "medium") return 2;

  return 1; // Low priority
};

/**
 * Calculate severity based on feedback content
 */
const calculateSeverity = (overallRating, tags = [], comment = "") => {
  const highSeverityTags = [
    "damaged_item",
    "poor_quality",
    "app_crash",
    "payment_issue",
  ];
  const mediumSeverityTags = ["delivery_delay", "app_slow", "hard_to_navigate"];

  // High severity conditions
  if (overallRating <= 2) return "high";
  if (tags.some((tag) => highSeverityTags.includes(tag))) return "high";
  if (
    comment.toLowerCase().includes("urgent") ||
    comment.toLowerCase().includes("immediate")
  )
    return "high";

  // Medium severity conditions
  if (overallRating === 3) return "medium";
  if (tags.some((tag) => mediumSeverityTags.includes(tag))) return "medium";

  return "low";
};

/**
 * Submit feedback to Firestore
 */
export const submitFeedback = async (feedbackData) => {
  try {
    // Validate required fields
    if (!feedbackData.userId) {
      return {
        success: false,
        error: "User ID is required",
        message: "Please log in to submit feedback",
      };
    }

    if (
      !feedbackData.overallRatting ||
      parseInt(feedbackData.overallRatting) < 1
    ) {
      return {
        success: false,
        error: "Rating is required",
        message: "Please provide a rating",
      };
    }

    const deviceInfo = getDeviceInfo();
    const appVersion = getAppVersion();
    const keywords = generateKeywords(
      feedbackData.comment,
      feedbackData.tags,
      feedbackData.category
    );
    const sentiment = calculateSentiment(
      parseInt(feedbackData.overallRatting),
      feedbackData.tags
    );
    const severity = calculateSeverity(
      parseInt(feedbackData.overallRatting),
      feedbackData.tags,
      feedbackData.comment
    );
    const priority = calculatePriority(
      parseInt(feedbackData.overallRatting),
      feedbackData.tags,
      severity
    );

    const feedbackDocument = {
      // User Information
      userId: feedbackData.userId || "",
      userEmail: feedbackData.userEmail || "",
      isAnonymous: feedbackData.isAnonymous || false,

      // Feedback Content
      title: generateFeedbackTitle(feedbackData),
      comment: feedbackData.comment || "",
      overallRatting: feedbackData.overallRatting, // Keep typo for backend compatibility
      subRatings: feedbackData.subRatings || {},

      // Context Information
      orderId: feedbackData.orderId || null,
      productId: feedbackData.productId || null,
      category: feedbackData.category || "general",
      subcategory: feedbackData.subcategory || null,

      // Tags and Keywords
      tags: feedbackData.tags || [],
      keywords: keywords,

      // Contact Information
      contactInfo: {
        email: feedbackData.contactInfo?.email || feedbackData.userEmail || "",
        phone: feedbackData.contactInfo?.phone || null,
      },
      preferredContactMethod: feedbackData.contactInfo?.phone
        ? "phone"
        : "email",
      followUpRequested: feedbackData.followUpRequested || false,

      // Auto-calculated Fields
      sentiment: sentiment,
      severity: severity,
      priority: priority,

      // System Information
      appVersion: appVersion,
      deviceInfo: deviceInfo,

      // Status Tracking
      status: "new",
      assignedTo: null,
      adminNotes: "",
      resolution: "",

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,

      // Analytics
      helpfulVotes: 0,
      reportedCount: 0,

      // Attachments (for future use)
      attachements: [], // Keep typo for backend compatibility
    };

    // Add to Firestore
    const docRef = await addDoc(
      collection(db, "customer_feedback"),
      feedbackDocument
    );

    console.log("Feedback submitted successfully with ID:", docRef.id);

    return {
      success: true,
      feedbackId: docRef.id,
      message: "Feedback submitted successfully",
    };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to submit feedback",
    };
  }
};

/**
 * Generate a title for the feedback based on its content
 */
const generateFeedbackTitle = (feedbackData) => {
  const rating = parseInt(feedbackData.overallRatting);
  const category = feedbackData.category || "general";

  // Based on rating
  if (rating >= 4) {
    return `Great ${category} experience`;
  } else if (rating === 3) {
    return `Average ${category} experience`;
  } else {
    return `${category} needs improvement`;
  }
};

/**
 * Fetch user's feedback history
 */
export const getUserFeedbackHistory = async (userId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, "customer_feedback"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const feedback = [];

    querySnapshot.forEach((doc) => {
      feedback.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      feedback: feedback,
    };
  } catch (error) {
    console.error("Error fetching feedback history:", error);
    return {
      success: false,
      error: error.message,
      feedback: [],
    };
  }
};

/**
 * Check if user has already given feedback for a specific order/product
 */
export const checkExistingFeedback = async (
  userId,
  orderId = null,
  productId = null
) => {
  try {
    let q;

    if (orderId) {
      q = query(
        collection(db, "customer_feedback"),
        where("userId", "==", userId),
        where("orderId", "==", orderId)
      );
    } else if (productId) {
      q = query(
        collection(db, "customer_feedback"),
        where("userId", "==", userId),
        where("productId", "==", productId)
      );
    } else {
      return { exists: false };
    }

    const querySnapshot = await getDocs(q);

    return {
      exists: !querySnapshot.empty,
      feedback: querySnapshot.empty
        ? null
        : {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
          },
    };
  } catch (error) {
    console.error("Error checking existing feedback:", error);
    return { exists: false, error: error.message };
  }
};

/**
 * Update existing feedback (if needed)
 */
export const updateFeedback = async (feedbackId, updateData) => {
  try {
    const feedbackRef = doc(db, "customer_feedback", feedbackId);

    const updatePayload = {
      ...updateData,
      updatedAt: new Date(),
    };

    await updateDoc(feedbackRef, updatePayload);

    return {
      success: true,
      message: "Feedback updated successfully",
    };
  } catch (error) {
    console.error("Error updating feedback:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to update feedback",
    };
  }
};

/**
 * Get feedback statistics for analytics
 */
export const getFeedbackStats = async (userId) => {
  try {
    const q = query(
      collection(db, "customer_feedback"),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    let totalFeedback = 0;
    let averageRating = 0;
    let sentimentCounts = { positive: 0, neutral: 0, negative: 0 };

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalFeedback++;
      averageRating += parseInt(data.overallRatting || 0);
      sentimentCounts[data.sentiment] =
        (sentimentCounts[data.sentiment] || 0) + 1;
    });

    averageRating =
      totalFeedback > 0 ? (averageRating / totalFeedback).toFixed(1) : 0;

    return {
      success: true,
      stats: {
        totalFeedback,
        averageRating: parseFloat(averageRating),
        sentimentCounts,
      },
    };
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    return {
      success: false,
      error: error.message,
      stats: null,
    };
  }
};
