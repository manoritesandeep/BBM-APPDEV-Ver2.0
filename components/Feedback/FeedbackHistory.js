import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../store/auth-context";
import { Colors } from "../../constants/styles";
import { scaleSize, spacing, typography } from "../../constants/responsive";
import { getUserFeedbackHistory } from "../../util/feedbackService";

function FeedbackHistoryCard({ feedback }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return Colors.primary500;
      case "in_progress":
        return Colors.accent500;
      case "resolved":
        return Colors.success;
      default:
        return Colors.gray500;
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "happy";
      case "negative":
        return "sad";
      default:
        return "remove";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Unknown";
    const feedbackDate = date.toDate ? date.toDate() : new Date(date);
    return feedbackDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.feedbackCard}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.feedbackTitle}>
            {feedback.title || "Feedback"}
          </Text>
          <Text style={styles.feedbackDate}>
            {formatDate(feedback.createdAt)}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(feedback.status) },
            ]}
          >
            <Text style={styles.statusText}>{feedback.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Rating:</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={
                  star <= parseInt(feedback.overallRatting)
                    ? "star"
                    : "star-outline"
                }
                size={16}
                color={
                  star <= parseInt(feedback.overallRatting)
                    ? "#FFD700"
                    : Colors.gray400
                }
              />
            ))}
          </View>
          <Ionicons
            name={getSentimentIcon(feedback.sentiment)}
            size={18}
            color={Colors.gray600}
            style={styles.sentimentIcon}
          />
        </View>

        {feedback.comment && (
          <Text style={styles.comment} numberOfLines={2}>
            "{feedback.comment}"
          </Text>
        )}

        {feedback.tags && feedback.tags.length > 0 && (
          <View style={styles.tags}>
            {feedback.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag.replace("_", " ")}</Text>
              </View>
            ))}
            {feedback.tags.length > 3 && (
              <Text style={styles.moreTagsText}>
                +{feedback.tags.length - 3} more
              </Text>
            )}
          </View>
        )}

        {feedback.resolution && (
          <View style={styles.resolutionSection}>
            <Text style={styles.resolutionLabel}>Resolution:</Text>
            <Text style={styles.resolutionText}>{feedback.resolution}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function FeedbackHistory() {
  const { userId } = useContext(AuthContext);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeedbackHistory = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await getUserFeedbackHistory(userId, 20);
      if (result.success) {
        setFeedbackHistory(result.feedback);
      }
    } catch (error) {
      console.error("Error loading feedback history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadFeedbackHistory();
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary500} />
        <Text style={styles.loadingText}>Loading your feedback...</Text>
      </View>
    );
  }

  if (feedbackHistory.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-outline" size={48} color={Colors.gray400} />
        <Text style={styles.emptyTitle}>No Feedback Yet</Text>
        <Text style={styles.emptyText}>
          When you submit feedback, it will appear here for you to track.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Feedback History</Text>
        <TouchableOpacity
          onPress={() => loadFeedbackHistory(true)}
          disabled={refreshing}
          style={styles.refreshButton}
        >
          <Ionicons
            name="refresh"
            size={20}
            color={Colors.primary500}
            style={refreshing ? styles.spinning : null}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {feedbackHistory.map((feedback) => (
          <FeedbackHistoryCard key={feedback.id} feedback={feedback} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: Colors.gray600,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: Colors.gray700,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: Colors.gray500,
    textAlign: "center",
    lineHeight: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    ...typography.h2,
    color: Colors.gray900,
    fontWeight: "600",
  },
  refreshButton: {
    padding: spacing.xs,
  },
  spinning: {
    // Add rotation animation if needed
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  feedbackCard: {
    backgroundColor: "white",
    borderRadius: scaleSize(12),
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: spacing.sm,
  },
  feedbackTitle: {
    ...typography.h4,
    color: Colors.gray900,
    fontWeight: "600",
    marginBottom: spacing.xs / 2,
  },
  feedbackDate: {
    ...typography.caption,
    color: Colors.gray500,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: scaleSize(12),
  },
  statusText: {
    ...typography.caption,
    color: "white",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  cardContent: {
    gap: spacing.sm,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  ratingLabel: {
    ...typography.body,
    color: Colors.gray700,
    fontWeight: "500",
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  sentimentIcon: {
    marginLeft: spacing.sm,
  },
  comment: {
    ...typography.body,
    color: Colors.gray600,
    fontStyle: "italic",
    lineHeight: 18,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    alignItems: "center",
  },
  tag: {
    backgroundColor: Colors.primary100,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
  tagText: {
    ...typography.caption,
    color: Colors.primary700,
    textTransform: "capitalize",
  },
  moreTagsText: {
    ...typography.caption,
    color: Colors.gray500,
    fontStyle: "italic",
  },
  resolutionSection: {
    backgroundColor: Colors.success50,
    padding: spacing.sm,
    borderRadius: scaleSize(8),
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  resolutionLabel: {
    ...typography.caption,
    color: Colors.success,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: spacing.xs / 2,
  },
  resolutionText: {
    ...typography.body,
    color: Colors.gray700,
    lineHeight: 18,
  },
});

export default FeedbackHistory;
