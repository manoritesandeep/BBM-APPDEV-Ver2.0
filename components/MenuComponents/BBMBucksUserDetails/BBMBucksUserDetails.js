import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import { AuthContext } from "../../../store/auth-context";
import { BBMBucksContext } from "../../../store/bbm-bucks-context";
import BBMBucksService from "../../../util/bbmBucksService";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../../constants/responsive";

function BBMBucksUserDetails({ onSignUpPress }) {
  const { isAuthenticated, userId } = useContext(AuthContext);
  const {
    balance,
    loading,
    transactions,
    refreshBalance,
    getTransactionHistory,
    canRedeem,
    minimumRedemption,
    conversionRate,
  } = useContext(BBMBucksContext);

  const [showTransactions, setShowTransactions] = useState(false);
  const [expiringBucks, setExpiringBucks] = useState([]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadTransactions();
      checkExpiringBucks();
    }
  }, [isAuthenticated, userId]);

  const loadTransactions = async () => {
    await getTransactionHistory(5); // Load last 5 transactions
  };

  const checkExpiringBucks = async () => {
    if (!userId) return;

    try {
      const expiring = await BBMBucksService.getExpiringBBMBucks(userId, 30);
      setExpiringBucks(expiring);
    } catch (error) {
      console.error("Error checking expiring BBM Bucks:", error);
    }
  };

  const handleRefresh = () => {
    refreshBalance();
    loadTransactions();
    checkExpiringBucks();
  };

  const showRewardInfo = () => {
    Alert.alert(
      "BBM Bucks Rewards",
      `Earn BBM Bucks on every purchase!\n\n` +
        `🎯 Standard Orders: 1% back\n` +
        `🎯 Premium Orders (₹25k+): 1.5% back\n` +
        `🎯 Elite Orders (₹50k+): 2% back\n\n` +
        `💰 ${conversionRate} BBM Bucks = ₹1 discount\n` +
        `⏰ Valid for 12 months\n` +
        `🔄 Minimum redemption: ${minimumRedemption} BBM Bucks`,
      [{ text: "Got it!", style: "default" }]
    );
  };

  // Render for non-authenticated users
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.signupPrompt}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="gift"
              size={scaleSize(40)}
              color={Colors.primary500}
            />
          </View>

          <Text style={styles.signupTitle}>Unlock BBM Bucks!</Text>

          <Text style={styles.signupDescription}>
            Sign up to earn rewards on every purchase and save money on future
            orders.
          </Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons
                name="checkmark-circle"
                size={scaleSize(16)}
                color={Colors.success}
              />
              <Text style={styles.benefitText}>
                Earn 1-2% back on all orders
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons
                name="checkmark-circle"
                size={scaleSize(16)}
                color={Colors.success}
              />
              <Text style={styles.benefitText}>
                Use as discount on future purchases
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons
                name="checkmark-circle"
                size={scaleSize(16)}
                color={Colors.success}
              />
              <Text style={styles.benefitText}>No expiry for 12 months</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.signupButton} onPress={onSignUpPress}>
            <Text style={styles.signupButtonText}>Sign Up & Start Earning</Text>
            <Ionicons name="arrow-forward" size={scaleSize(16)} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={showRewardInfo}
          >
            <Text style={styles.learnMoreText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render for authenticated users
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main BBM Bucks Card */}
      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>BBM Bucks</Text>
            <TouchableOpacity onPress={handleRefresh} disabled={loading}>
              <Ionicons
                name="refresh"
                size={scaleSize(20)}
                color={Colors.primary500}
                style={[loading && { opacity: 0.5 }]}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={showRewardInfo}>
            <Ionicons
              name="information-circle"
              size={scaleSize(16)}
              color={Colors.gray400}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary500} />
            <Text style={styles.loadingText}>Loading your rewards...</Text>
          </View>
        ) : (
          <>
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                {balance?.currentBalance || 0} BBM Bucks
              </Text>
              <Text style={styles.discountValue}>
                Worth ₹{balance?.discountValue || "0.00"} discount
              </Text>
            </View>

            {/* Reward Status */}
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Total Earned</Text>
                <Text style={styles.statusValue}>
                  {balance?.totalEarned || 0}
                </Text>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Total Used</Text>
                <Text style={styles.statusValue}>
                  {balance?.totalRedeemed || 0}
                </Text>
              </View>
            </View>

            {/* Expiring Alert */}
            {expiringBucks.length > 0 && (
              <View style={styles.expiringAlert}>
                <Ionicons
                  name="time"
                  size={scaleSize(16)}
                  color={Colors.warning}
                />
                <Text style={styles.expiringText}>
                  {expiringBucks.reduce((sum, item) => sum + item.amount, 0)}{" "}
                  BBM Bucks expiring soon!
                </Text>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  !canRedeem && styles.actionButtonDisabled,
                ]}
                disabled={!canRedeem}
                onPress={() =>
                  Alert.alert(
                    "Redeem BBM Bucks",
                    "Add items to cart to redeem your BBM Bucks!"
                  )
                }
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    !canRedeem && styles.actionButtonTextDisabled,
                  ]}
                >
                  {canRedeem
                    ? "Ready to Use"
                    : `Min ${minimumRedemption} needed`}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Transaction History */}
      <View style={styles.historySection}>
        <TouchableOpacity
          style={styles.historyHeader}
          onPress={() => setShowTransactions(!showTransactions)}
        >
          <Text style={styles.historyTitle}>Recent Activity</Text>
          <Ionicons
            name={showTransactions ? "chevron-up" : "chevron-down"}
            size={scaleSize(20)}
            color={Colors.gray600}
          />
        </TouchableOpacity>

        {showTransactions && (
          <View style={styles.transactionsList}>
            {transactions.length === 0 ? (
              <Text style={styles.noTransactionsText}>
                No transactions yet. Start shopping to earn BBM Bucks!
              </Text>
            ) : (
              transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))
            )}
          </View>
        )}
      </View>

      {/* Tier Information */}
      <View style={styles.tierSection}>
        <Text style={styles.tierTitle}>Reward Tiers</Text>
        <View style={styles.tiersList}>
          {Object.values(BBMBucksService.REWARD_TIERS).map((tier) => (
            <View key={tier.name} style={styles.tierItem}>
              <Text style={styles.tierName}>{tier.name}</Text>
              <Text style={styles.tierDescription}>
                {tier.maxAmount === Infinity
                  ? `₹${tier.minAmount.toLocaleString("en-IN")}+ orders`
                  : `₹${tier.minAmount.toLocaleString(
                      "en-IN"
                    )} - ₹${tier.maxAmount.toLocaleString("en-IN")}`}
              </Text>
              <Text style={styles.tierReward}>{tier.percentage}% back</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// Transaction Item Component
function TransactionItem({ transaction }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isEarned = transaction.type === "EARNED";

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons
          name={isEarned ? "add-circle" : "remove-circle"}
          size={scaleSize(20)}
          color={isEarned ? Colors.success : Colors.error}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription} numberOfLines={2}>
          {transaction.description}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.createdAt)}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: isEarned ? Colors.success : Colors.error },
        ]}
      >
        {isEarned ? "+" : ""}
        {transaction.amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  // Non-authenticated user styles
  signupPrompt: {
    backgroundColor: "white",
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: scaleSize(12),
    alignItems: "center",
    ...deviceAdjustments.shadow,
  },
  iconContainer: {
    backgroundColor: Colors.primary100,
    width: scaleSize(80),
    height: scaleSize(80),
    borderRadius: scaleSize(40),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  signupTitle: {
    ...typography.heading3,
    color: Colors.gray900,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  signupDescription: {
    ...typography.body2,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: scaleSize(20),
  },
  benefitsList: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  benefitText: {
    ...typography.body2,
    color: Colors.gray700,
    marginLeft: spacing.sm,
    flex: 1,
  },
  signupButton: {
    backgroundColor: Colors.primary500,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: scaleSize(8),
    marginBottom: spacing.sm,
  },
  signupButtonText: {
    ...typography.button,
    color: "white",
    marginRight: spacing.sm,
  },
  learnMoreButton: {
    paddingVertical: spacing.sm,
  },
  learnMoreText: {
    ...typography.body2,
    color: Colors.primary500,
    textDecorationLine: "underline",
  },

  // Authenticated user styles
  mainCard: {
    backgroundColor: "white",
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: scaleSize(12),
    ...deviceAdjustments.shadow,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    ...typography.heading3,
    color: Colors.gray900,
    marginRight: spacing.sm,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  loadingText: {
    ...typography.body2,
    color: Colors.gray600,
    marginLeft: spacing.sm,
  },
  balanceSection: {
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    marginBottom: spacing.md,
  },
  balanceLabel: {
    ...typography.body2,
    color: Colors.gray600,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    ...typography.heading2,
    color: Colors.primary600,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  discountValue: {
    ...typography.body1,
    color: Colors.success,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  statusItem: {
    flex: 1,
    alignItems: "center",
  },
  statusDivider: {
    width: 1,
    backgroundColor: Colors.gray200,
    marginHorizontal: spacing.md,
  },
  statusLabel: {
    ...typography.caption,
    color: Colors.gray600,
    marginBottom: spacing.xs,
  },
  statusValue: {
    ...typography.body1,
    color: Colors.gray900,
    fontWeight: "600",
  },
  expiringAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning100,
    padding: spacing.sm,
    borderRadius: scaleSize(6),
    marginBottom: spacing.md,
  },
  expiringText: {
    ...typography.caption,
    color: Colors.warning700,
    marginLeft: spacing.sm,
    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: spacing.sm,
    borderRadius: scaleSize(6),
    alignItems: "center",
  },
  actionButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  actionButtonText: {
    ...typography.button,
    color: "white",
    fontSize: scaleSize(12),
  },
  actionButtonTextDisabled: {
    color: Colors.gray600,
  },

  // History section
  historySection: {
    backgroundColor: "white",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: scaleSize(12),
    ...deviceAdjustments.shadow,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  historyTitle: {
    ...typography.heading4,
    color: Colors.gray900,
  },
  transactionsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  noTransactionsText: {
    ...typography.body2,
    color: Colors.gray600,
    textAlign: "center",
    paddingVertical: spacing.lg,
    fontStyle: "italic",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  transactionIcon: {
    marginRight: spacing.sm,
  },
  transactionDetails: {
    flex: 1,
    marginRight: spacing.sm,
  },
  transactionDescription: {
    ...typography.body2,
    color: Colors.gray900,
    marginBottom: spacing.xs,
  },
  transactionDate: {
    ...typography.caption,
    color: Colors.gray600,
  },
  transactionAmount: {
    ...typography.body1,
    fontWeight: "600",
  },

  // Tier section
  tierSection: {
    backgroundColor: "white",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: scaleSize(12),
    ...deviceAdjustments.shadow,
  },
  tierTitle: {
    ...typography.heading4,
    color: Colors.gray900,
    marginBottom: spacing.md,
  },
  tiersList: {
    gap: spacing.sm,
  },
  tierItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: Colors.gray50,
    borderRadius: scaleSize(6),
  },
  tierName: {
    ...typography.body2,
    color: Colors.gray900,
    fontWeight: "600",
    width: scaleSize(60),
  },
  tierDescription: {
    ...typography.caption,
    color: Colors.gray600,
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  tierReward: {
    ...typography.body2,
    color: Colors.primary600,
    fontWeight: "600",
  },
});

export default BBMBucksUserDetails;
