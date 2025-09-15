import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import { BBMBucksContext } from "../../../store/bbm-bucks-context";
import { AuthContext } from "../../../store/auth-context";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../../constants/responsive";

function BBMBucksOrderSuccess({
  orderId,
  orderAmount,
  categories = [],
  rewardEarned = null, // Pass this if reward was already calculated
  onRewardProcessed,
}) {
  const { isAuthenticated } = useContext(AuthContext);
  const { awardBBMBucks } = useContext(BBMBucksContext);

  const [processing, setProcessing] = useState(true);
  const [reward, setReward] = useState(rewardEarned);
  const [error, setError] = useState(null);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (isAuthenticated && orderId && !rewardEarned) {
      processReward();
    } else if (rewardEarned) {
      setReward(rewardEarned);
      setProcessing(false);
      animateIn();
    } else {
      setProcessing(false);
    }
  }, [isAuthenticated, orderId, rewardEarned]);

  const processReward = async () => {
    try {
      setProcessing(true);
      setError(null);

      const awardedReward = await awardBBMBucks(
        orderId,
        orderAmount,
        categories
      );

      if (awardedReward && awardedReward.bbmBucks > 0) {
        setReward(awardedReward);
        onRewardProcessed?.(awardedReward);
      }

      animateIn();
    } catch (err) {
      console.error("Error processing BBM Bucks reward:", err);
      setError("Failed to process reward");
    } finally {
      setProcessing(false);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (!isAuthenticated) {
    return null;
  }

  if (processing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="small" color={Colors.primary500} />
        <Text style={styles.processingText}>Processing your reward...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle"
          size={scaleSize(20)}
          color={Colors.error}
        />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!reward || reward.bbmBucks === 0) {
    // Show why no reward was earned
    if (reward && reward.reason) {
      return (
        <View style={styles.noRewardContainer}>
          <Ionicons
            name="information-circle"
            size={scaleSize(20)}
            color={Colors.gray500}
          />
          <Text style={styles.noRewardText}>{reward.reason}</Text>
        </View>
      );
    }
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.successContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.successHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="gift" size={scaleSize(24)} color={Colors.success} />
        </View>
        <Text style={styles.successTitle}>BBM Bucks Earned!</Text>
      </View>

      <View style={styles.rewardDetails}>
        <View style={styles.rewardRow}>
          <Text style={styles.rewardLabel}>BBM Bucks Earned:</Text>
          <Text style={styles.rewardAmount}>+{reward.bbmBucks}</Text>
        </View>

        <View style={styles.rewardRow}>
          <Text style={styles.rewardLabel}>Reward Tier:</Text>
          <Text style={styles.rewardTier}>
            {reward.tier} ({reward.percentage}%)
          </Text>
        </View>

        <View style={styles.rewardRow}>
          <Text style={styles.rewardLabel}>Future Discount Value:</Text>
          <Text style={styles.discountValue}>
            ₹{reward.discountValue.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Ionicons name="time" size={scaleSize(14)} color={Colors.gray600} />
          <Text style={styles.infoText}>Valid for 12 months</Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="card" size={scaleSize(14)} color={Colors.gray600} />
          <Text style={styles.infoText}>Use on future orders</Text>
        </View>
      </View>

      <View style={styles.conversionNote}>
        <Text style={styles.conversionText}>
          {reward.conversionRate} BBM Bucks = ₹1 discount
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: scaleSize(8),
    marginVertical: spacing.sm,
  },
  processingText: {
    ...typography.body2,
    color: Colors.gray600,
    marginLeft: spacing.sm,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: Colors.error50,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.error200,
    marginVertical: spacing.sm,
  },
  errorText: {
    ...typography.body2,
    color: Colors.error700,
    marginLeft: spacing.sm,
    flex: 1,
  },
  noRewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: scaleSize(8),
    marginVertical: spacing.sm,
  },
  noRewardText: {
    ...typography.body2,
    color: Colors.gray600,
    marginLeft: spacing.sm,
    flex: 1,
  },
  successContainer: {
    backgroundColor: Colors.success50,
    padding: spacing.lg,
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: Colors.success200,
    marginVertical: spacing.sm,
    ...deviceAdjustments.shadow,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconContainer: {
    backgroundColor: Colors.success100,
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: scaleSize(20),
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  successTitle: {
    ...typography.heading3,
    color: Colors.success700,
    fontWeight: "bold",
  },
  rewardDetails: {
    backgroundColor: "white",
    padding: spacing.md,
    borderRadius: scaleSize(8),
    marginBottom: spacing.md,
  },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  rewardLabel: {
    ...typography.body2,
    color: Colors.gray700,
  },
  rewardAmount: {
    ...typography.heading4,
    color: Colors.success600,
    fontWeight: "bold",
  },
  rewardTier: {
    ...typography.body2,
    color: Colors.primary600,
    fontWeight: "600",
  },
  discountValue: {
    ...typography.body1,
    color: Colors.success600,
    fontWeight: "600",
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  infoText: {
    ...typography.caption,
    color: Colors.gray600,
    marginLeft: spacing.xs,
    textAlign: "center",
  },
  conversionNote: {
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.success200,
  },
  conversionText: {
    ...typography.caption,
    color: Colors.success600,
    fontStyle: "italic",
  },
});

export default BBMBucksOrderSuccess;
