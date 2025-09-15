import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import { AuthContext } from "../../../store/auth-context";
import BBMBucksService from "../../../util/bbmBucksService";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../../constants/responsive";

function BBMBucksRewardDisplay({
  orderAmount,
  categories = [],
  onSignUpPress,
}) {
  const { isAuthenticated } = useContext(AuthContext);

  // Calculate potential reward
  const reward = BBMBucksService.calculateReward(orderAmount, categories);

  // Don't show if no reward or excluded categories
  if (reward.bbmBucks === 0) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.signupPromptContainer}>
        <View style={styles.rewardPreview}>
          <View style={styles.rewardIcon}>
            <Ionicons
              name="gift"
              size={scaleSize(20)}
              color={Colors.primary500}
            />
          </View>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>Earn BBM Bucks!</Text>
            <Text style={styles.rewardDescription}>
              Sign up to earn {reward.bbmBucks} BBM Bucks (₹
              {reward.discountValue.toFixed(2)}) on this order
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signupButton} onPress={onSignUpPress}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
          <Ionicons name="arrow-forward" size={scaleSize(14)} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.rewardContainer}>
      <View style={styles.rewardHeader}>
        <Ionicons name="gift" size={scaleSize(20)} color={Colors.success} />
        <Text style={styles.rewardHeaderText}>You'll earn BBM Bucks!</Text>
      </View>

      <View style={styles.rewardDetails}>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardLabel}>Reward Tier:</Text>
          <Text style={styles.rewardValue}>
            {reward.tier} ({reward.percentage}%)
          </Text>
        </View>

        <View style={styles.rewardItem}>
          <Text style={styles.rewardLabel}>BBM Bucks:</Text>
          <Text style={styles.rewardValue}>{reward.bbmBucks}</Text>
        </View>

        <View style={styles.rewardItem}>
          <Text style={styles.rewardLabel}>Future Discount:</Text>
          <Text style={styles.rewardValue}>
            ₹{reward.discountValue.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.rewardNote}>
        <Ionicons name="time" size={scaleSize(14)} color={Colors.gray600} />
        <Text style={styles.rewardNoteText}>
          Valid for 12 months • Use on future orders
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Signup prompt styles
  signupPromptContainer: {
    backgroundColor: Colors.primary50,
    padding: spacing.md,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.primary200,
    marginVertical: spacing.sm,
  },
  rewardPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  rewardIcon: {
    marginRight: spacing.sm,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    ...typography.body1,
    color: Colors.primary700,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  rewardDescription: {
    ...typography.body2,
    color: Colors.primary600,
    lineHeight: scaleSize(18),
  },
  signupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary500,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: scaleSize(6),
    alignSelf: "flex-start",
  },
  signupButtonText: {
    ...typography.button,
    color: "white",
    marginRight: spacing.xs,
    fontSize: scaleSize(12),
  },

  // Authenticated user reward display
  rewardContainer: {
    backgroundColor: Colors.success50,
    padding: spacing.md,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.success200,
    marginVertical: spacing.sm,
  },
  rewardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  rewardHeaderText: {
    ...typography.body1,
    color: Colors.success700,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  rewardDetails: {
    marginBottom: spacing.sm,
  },
  rewardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  rewardLabel: {
    ...typography.body2,
    color: Colors.success600,
  },
  rewardValue: {
    ...typography.body2,
    color: Colors.success700,
    fontWeight: "600",
  },
  rewardNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rewardNoteText: {
    ...typography.caption,
    color: Colors.gray600,
    marginLeft: spacing.xs,
    textAlign: "center",
  },
});

export default BBMBucksRewardDisplay;
