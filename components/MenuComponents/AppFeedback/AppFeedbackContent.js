import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import { scaleSize, spacing, typography } from "../../../constants/responsive";
import FeedbackTrigger from "../../Feedback/FeedbackTrigger";

function AppFeedbackContent() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="chatbubble-ellipses"
          size={32}
          color={Colors.primary500}
        />
        <Text style={styles.title}>Help Us Improve</Text>
        <Text style={styles.subtitle}>
          Your feedback helps us make BBM better for everyone
        </Text>
      </View>

      <View style={styles.content}>
        {/* App Experience Feedback */}
        <View style={styles.feedbackCard}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="phone-portrait"
              size={20}
              color={Colors.primary500}
            />
            <Text style={styles.cardTitle}>App Experience</Text>
          </View>
          <Text style={styles.cardDescription}>
            Share your thoughts about the app's usability, performance, and
            features
          </Text>
          <FeedbackTrigger
            type="app"
            compact={false}
            style={styles.feedbackButton}
          />
        </View>

        {/* Service Feedback */}
        <View style={styles.feedbackCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={20} color={Colors.success} />
            <Text style={styles.cardTitle}>Customer Service</Text>
          </View>
          <Text style={styles.cardDescription}>
            Rate our customer support and service quality
          </Text>
          <FeedbackTrigger
            type="service"
            compact={false}
            style={styles.feedbackButton}
          />
        </View>

        {/* Feature Suggestions */}
        <View style={styles.suggestionCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="bulb" size={20} color={Colors.accent500} />
            <Text style={styles.cardTitle}>Feature Suggestions</Text>
          </View>
          <Text style={styles.cardDescription}>
            Have an idea for a new feature? We'd love to hear it!
          </Text>
          <FeedbackTrigger
            type="app"
            compact={false}
            style={[
              styles.feedbackButton,
              { backgroundColor: Colors.accent500 },
            ]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Your feedback is valuable to us and helps improve the shopping
          experience for all users.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: "#fafafa",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h2,
    color: Colors.gray900,
    fontWeight: "700",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: Colors.gray600,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  content: {
    flex: 1,
  },
  feedbackCard: {
    backgroundColor: "white",
    borderRadius: scaleSize(12),
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionCard: {
    backgroundColor: "#fff8f0",
    borderRadius: scaleSize(12),
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent200,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent500,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    color: Colors.gray900,
    fontWeight: "600",
  },
  cardDescription: {
    ...typography.body,
    color: Colors.gray600,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  feedbackButton: {
    alignSelf: "flex-start",
  },
  footer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  footerText: {
    ...typography.caption,
    color: Colors.gray500,
    textAlign: "center",
    lineHeight: 18,
  },
});

export default AppFeedbackContent;
