import React, { useState, useContext, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../store/auth-context";
import { UserContext } from "../../store/user-context";
import { Colors } from "../../constants/styles";
import { scaleSize, spacing, typography } from "../../constants/responsive";
import Button from "../UI/Button";
import OutlinedButton from "../UI/OutlinedButton";
import LoadingOverlay from "../UI/LoadingOverlay";
import {
  submitFeedback,
  checkExistingFeedback,
} from "../../util/feedbackService";

const FEEDBACK_CATEGORIES = {
  order: {
    title: "Order Feedback",
    subRatings: [
      { key: "deliverySpeed", label: "Delivery Speed", icon: "time" },
      { key: "packaging", label: "Packaging Quality", icon: "cube" },
      { key: "productQuality", label: "Product Quality", icon: "star" },
      { key: "customerService", label: "Customer Service", icon: "people" },
    ],
  },
  product: {
    title: "Product Feedback",
    subRatings: [
      { key: "productQuality", label: "Product Quality", icon: "star" },
      { key: "valueForMoney", label: "Value for Money", icon: "cash" },
      {
        key: "description",
        label: "Description Accuracy",
        icon: "document-text",
      },
    ],
  },
  app: {
    title: "App Experience",
    subRatings: [
      { key: "appUsability", label: "App Usability", icon: "phone-portrait" },
      { key: "performance", label: "Performance", icon: "speedometer" },
      { key: "features", label: "Features", icon: "apps" },
    ],
  },
  service: {
    title: "Service Feedback",
    subRatings: [
      { key: "customerService", label: "Support Quality", icon: "help-circle" },
      { key: "responseTime", label: "Response Time", icon: "time" },
      {
        key: "problemResolution",
        label: "Problem Resolution",
        icon: "checkmark-circle",
      },
    ],
  },
};

const QUICK_FEEDBACK_TAGS = [
  { id: "excellent", label: "Excellent", type: "positive" },
  { id: "fast_delivery", label: "Fast Delivery", type: "positive" },
  { id: "good_quality", label: "Good Quality", type: "positive" },
  { id: "well_packaged", label: "Well Packaged", type: "positive" },
  { id: "delivery_delay", label: "Delivery Delay", type: "negative" },
  { id: "damaged_item", label: "Damaged Item", type: "negative" },
  { id: "poor_quality", label: "Poor Quality", type: "negative" },
  { id: "app_slow", label: "App Slow", type: "negative" },
  { id: "hard_to_navigate", label: "Hard to Navigate", type: "negative" },
  { id: "feature_request", label: "Feature Request", type: "neutral" },
];

const StarRating = memo(
  ({ rating, onRatingChange, size = 24, readonly = false }) => {
    const handleRatingPress = useCallback(
      (star) => {
        if (!readonly && onRatingChange) {
          onRatingChange(star);
        }
      },
      [readonly, onRatingChange]
    );

    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingPress(star)}
            disabled={readonly}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={size}
              color={star <= rating ? "#FFD700" : Colors.gray400}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }
);

function QuickFeedbackChips({ selectedTags, onToggleTag }) {
  return (
    <View style={styles.chipsContainer}>
      <Text style={styles.sectionLabel}>Quick Feedback (Optional):</Text>
      <View style={styles.chipsWrapper}>
        {QUICK_FEEDBACK_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
                tag.type === "negative" && isSelected && styles.chipNegative,
                tag.type === "positive" && isSelected && styles.chipPositive,
              ]}
              onPress={() => onToggleTag(tag.id)}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {tag.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function FeedbackModal({
  visible,
  onClose,
  feedbackType = "order", // order, product, app, service
  orderId = null,
  productId = null,
  orderData = null,
}) {
  const { userId } = useContext(AuthContext);
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  // Get user email from UserContext - fallback to empty string if not available
  const userEmail = user?.email || "";

  // Feedback state
  const [overallRating, setOverallRating] = useState(0);
  const [subRatings, setSubRatings] = useState({});
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    email: userEmail || "",
    phone: "",
  });
  const [followUpRequested, setFollowUpRequested] = useState(false);

  const categoryConfig = useMemo(
    () => FEEDBACK_CATEGORIES[feedbackType] || FEEDBACK_CATEGORIES.order,
    [feedbackType]
  );

  const handleSubRatingChange = useCallback((key, rating) => {
    setSubRatings((prev) => ({ ...prev, [key]: rating }));
  }, []);

  const handleTagToggle = useCallback((tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  const resetForm = useCallback(() => {
    setOverallRating(0);
    setSubRatings({});
    setComment("");
    setSelectedTags([]);
    setFollowUpRequested(false);
  }, []);

  const validateForm = useCallback(() => {
    if (!userId) {
      Alert.alert(
        "Authentication Required",
        "Please log in to submit feedback."
      );
      return false;
    }

    if (overallRating === 0) {
      Alert.alert("Missing Rating", "Please provide an overall rating.");
      return false;
    }
    return true;
  }, [userId, overallRating]);

  const submitFeedbackHandler = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Check if user has already given feedback for this order/product
      if (orderId || productId) {
        const existingCheck = await checkExistingFeedback(
          userId,
          orderId,
          productId
        );
        if (existingCheck.exists) {
          Alert.alert(
            "Feedback Already Submitted",
            "You have already provided feedback for this item. Thank you for your input!",
            [
              {
                text: "OK",
                onPress: () => {
                  resetForm();
                  onClose(false); // Pass false to indicate no feedback was submitted
                },
              },
            ]
          );
          setLoading(false);
          return;
        }
      }

      const feedbackData = {
        userId: userId,
        userEmail: userEmail,
        orderId: orderId,
        productId: productId,
        category: feedbackType,
        overallRatting: overallRating.toString(), // Keep typo for backend compatibility
        subRatings: subRatings,
        comment: comment.trim(),
        tags: selectedTags,
        contactInfo: contactInfo,
        followUpRequested: followUpRequested,
        isAnonymous: false,
      };

      const result = await submitFeedback(feedbackData);

      if (result.success) {
        Alert.alert(
          "Thank You!",
          "Your feedback has been submitted successfully. We appreciate your input and will use it to improve our service!",
          [
            {
              text: "OK",
              onPress: () => {
                resetForm();
                onClose(true); // Pass true to indicate feedback was submitted
              },
            },
          ]
        );
      } else {
        throw new Error(result.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert(
        "Submission Failed",
        "Failed to submit feedback. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    resetForm();
    onClose(false); // Pass false to indicate no feedback was submitted
  }, [resetForm, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {loading && <LoadingOverlay message="Submitting feedback..." />}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{categoryConfig.title}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.gray700} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Overall Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall Rating</Text>
            <StarRating
              rating={overallRating}
              onRatingChange={setOverallRating}
              size={32}
            />
          </View>

          {/* Sub Ratings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rate Your Experience</Text>
            {categoryConfig.subRatings.map((item) => (
              <View key={item.key} style={styles.subRatingRow}>
                <View style={styles.subRatingLabel}>
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={Colors.gray600}
                    style={styles.subRatingIcon}
                  />
                  <Text style={styles.subRatingText}>{item.label}</Text>
                </View>
                <StarRating
                  rating={subRatings[item.key] || 0}
                  onRatingChange={(rating) =>
                    handleSubRatingChange(item.key, rating)
                  }
                  size={20}
                />
              </View>
            ))}
          </View>

          {/* Quick Feedback Tags */}
          <QuickFeedbackChips
            selectedTags={selectedTags}
            onToggleTag={handleTagToggle}
          />

          {/* Comment */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Additional Comments (Optional):
            </Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Share more details about your experience..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>{comment.length}/500</Text>
          </View>

          {/* Contact Info for Follow-up */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.followUpToggle}
              onPress={() => setFollowUpRequested(!followUpRequested)}
            >
              <Ionicons
                name={followUpRequested ? "checkbox" : "checkbox-outline"}
                size={20}
                color={Colors.primary500}
              />
              <Text style={styles.followUpText}>
                Request follow-up on this feedback
              </Text>
            </TouchableOpacity>

            {followUpRequested && (
              <View style={styles.contactSection}>
                <Text style={styles.sectionLabel}>Contact Information:</Text>
                <TextInput
                  style={styles.contactInput}
                  value={contactInfo.email}
                  onChangeText={(text) =>
                    setContactInfo((prev) => ({ ...prev, email: text }))
                  }
                  placeholder="Email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.contactInput}
                  value={contactInfo.phone}
                  onChangeText={(text) =>
                    setContactInfo((prev) => ({ ...prev, phone: text }))
                  }
                  placeholder="Phone number (optional)"
                  keyboardType="phone-pad"
                />
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <OutlinedButton onPress={handleClose} style={styles.actionButton}>
              Cancel
            </OutlinedButton>
            <Button onPress={submitFeedbackHandler} style={styles.actionButton}>
              Submit Feedback
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    paddingTop: spacing.xl,
    backgroundColor: Colors.primary300,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
  },
  headerTitle: {
    ...typography.h2,
    color: Colors.accent700,
    fontWeight: "600",
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: Colors.gray900,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  sectionLabel: {
    ...typography.body,
    color: Colors.gray700,
    marginBottom: spacing.xs,
    fontWeight: "500",
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  starButton: {
    padding: spacing.xs,
  },
  subRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  subRatingLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  subRatingIcon: {
    marginRight: spacing.xs,
  },
  subRatingText: {
    ...typography.body,
    color: Colors.gray700,
  },
  chipsContainer: {
    marginBottom: spacing.md,
  },
  chipsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: scaleSize(16),
    backgroundColor: Colors.gray200,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  chipSelected: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary500,
  },
  chipPositive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  chipNegative: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  chipText: {
    ...typography.caption,
    color: Colors.gray700,
  },
  chipTextSelected: {
    color: "white",
    fontWeight: "500",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: scaleSize(8),
    padding: spacing.sm,
    backgroundColor: "white",
    ...typography.body,
    minHeight: scaleSize(100),
  },
  characterCount: {
    ...typography.caption,
    color: Colors.gray500,
    textAlign: "right",
    marginTop: spacing.xs,
  },
  followUpToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  followUpText: {
    ...typography.body,
    color: Colors.gray700,
  },
  contactSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  contactInput: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: scaleSize(8),
    padding: spacing.sm,
    backgroundColor: "white",
    ...typography.body,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});

export default memo(FeedbackModal);
