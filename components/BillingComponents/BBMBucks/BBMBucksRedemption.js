import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import { BBMBucksContext } from "../../../store/bbm-bucks-context";
import { AuthContext } from "../../../store/auth-context";
import BBMBucksService from "../../../util/bbmBucksService";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../../constants/responsive";

function BBMBucksRedemption({
  orderAmount,
  categories = [],
  onRedemptionChange,
  appliedAmount = 0,
  disabled = false,
}) {
  const { isAuthenticated } = useContext(AuthContext);
  const {
    balance,
    loading,
    canRedeem,
    redeemBBMBucks,
    getMaxRedeemable,
    minimumRedemption,
    conversionRate,
  } = useContext(BBMBucksContext);

  const [redeemAmount, setRedeemAmount] = useState(appliedAmount);
  const [showRedemption, setShowRedemption] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Check if BBM Bucks can be used for this order
  const canUseBBMBucks = BBMBucksService.canUseBBMBucks(
    orderAmount,
    categories
  );
  const maxRedeemable = balance ? getMaxRedeemable(orderAmount) : 0;

  useEffect(() => {
    setRedeemAmount(appliedAmount);
  }, [appliedAmount]);

  const handleApplyRedemption = () => {
    if (redeemAmount < minimumRedemption) {
      Alert.alert(
        "Minimum Redemption",
        `Minimum redemption amount is ${minimumRedemption} BBM Bucks (₹${(
          minimumRedemption / conversionRate
        ).toFixed(2)})`
      );
      return;
    }

    if (redeemAmount > balance.currentBalance) {
      Alert.alert("Insufficient Balance", "You don't have enough BBM Bucks.");
      return;
    }

    if (redeemAmount > maxRedeemable) {
      Alert.alert(
        "Redemption Limit",
        `Maximum redeemable amount for this order is ${maxRedeemable} BBM Bucks.`
      );
      return;
    }

    const discountValue = redeemAmount / conversionRate;
    onRedemptionChange?.(redeemAmount, discountValue);
    setShowRedemption(false);
  };

  const handleRemoveRedemption = () => {
    setRedeemAmount(0);
    onRedemptionChange?.(0, 0);
  };

  const setMaxAmount = () => {
    setRedeemAmount(maxRedeemable);
  };

  if (!isAuthenticated || !canUseBBMBucks) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary500} />
        <Text style={styles.loadingText}>Loading BBM Bucks...</Text>
      </View>
    );
  }

  if (!balance || balance.currentBalance === 0) {
    return (
      <View style={styles.noBalanceContainer}>
        <Ionicons
          name="gift-outline"
          size={scaleSize(24)}
          color={Colors.gray400}
        />
        <Text style={styles.noBalanceText}>
          No BBM Bucks available. Start shopping to earn rewards!
        </Text>
      </View>
    );
  }

  // If redemption is applied
  if (appliedAmount > 0) {
    return (
      <View style={styles.appliedContainer}>
        <View style={styles.appliedHeader}>
          <View style={styles.appliedInfo}>
            <Ionicons name="gift" size={scaleSize(20)} color={Colors.success} />
            <Text style={styles.appliedTitle}>BBM Bucks Applied</Text>
          </View>
          <TouchableOpacity
            onPress={handleRemoveRedemption}
            disabled={disabled}
          >
            <Ionicons
              name="close-circle"
              size={scaleSize(20)}
              color={Colors.error}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.appliedDetails}>
          <Text style={styles.appliedAmount}>-{appliedAmount} BBM Bucks</Text>
          <Text style={styles.appliedDiscount}>
            ₹{(appliedAmount / conversionRate).toFixed(2)} discount
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!showRedemption ? (
        // Show available balance and option to redeem
        <TouchableOpacity
          style={[styles.availableContainer, disabled && styles.disabled]}
          onPress={() => setShowRedemption(true)}
          disabled={disabled || !canRedeem}
        >
          <View style={styles.availableInfo}>
            <Ionicons
              name="gift"
              size={scaleSize(20)}
              color={Colors.primary500}
            />
            <View style={styles.balanceInfo}>
              <Text style={styles.availableTitle}>BBM Bucks Available</Text>
              <Text style={styles.availableBalance}>
                {balance.currentBalance} BBM Bucks (₹{balance.discountValue})
              </Text>
            </View>
          </View>
          <View style={styles.availableAction}>
            {canRedeem ? (
              <Text style={styles.useText}>Use</Text>
            ) : (
              <Text style={styles.minimumText}>Min {minimumRedemption}</Text>
            )}
            <Ionicons
              name="chevron-forward"
              size={scaleSize(16)}
              color={Colors.gray600}
            />
          </View>
        </TouchableOpacity>
      ) : (
        // Show redemption form
        <View style={styles.redemptionForm}>
          <View style={styles.redemptionHeader}>
            <Text style={styles.redemptionTitle}>Redeem BBM Bucks</Text>
            <TouchableOpacity onPress={() => setShowRedemption(false)}>
              <Ionicons
                name="close"
                size={scaleSize(20)}
                color={Colors.gray600}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Available Balance:</Text>
            <Text style={styles.balanceValue}>
              {balance.currentBalance} BBM Bucks (₹{balance.discountValue})
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.amountInput}
              value={redeemAmount.toString()}
              onChangeText={(text) => {
                const amount = parseInt(text) || 0;
                setRedeemAmount(Math.min(amount, maxRedeemable));
              }}
              placeholder="Enter amount"
              keyboardType="numeric"
              maxLength={6}
            />
            <Text style={styles.inputSuffix}>BBM Bucks</Text>
          </View>

          <View style={styles.conversionInfo}>
            <Text style={styles.conversionText}>
              = ₹{(redeemAmount / conversionRate).toFixed(2)} discount
            </Text>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setRedeemAmount(minimumRedemption)}
            >
              <Text style={styles.quickActionText}>
                Min ({minimumRedemption})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={setMaxAmount}
            >
              <Text style={styles.quickActionText}>Max ({maxRedeemable})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.redemptionActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowRedemption(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.applyButton,
                (redeemAmount < minimumRedemption ||
                  redeemAmount > maxRedeemable) &&
                  styles.applyButtonDisabled,
              ]}
              onPress={handleApplyRedemption}
              disabled={
                redeemAmount < minimumRedemption || redeemAmount > maxRedeemable
              }
            >
              <Text
                style={[
                  styles.applyButtonText,
                  (redeemAmount < minimumRedemption ||
                    redeemAmount > maxRedeemable) &&
                    styles.applyButtonTextDisabled,
                ]}
              >
                Apply
              </Text>
            </TouchableOpacity>
          </View>

          {maxRedeemable < balance.currentBalance && (
            <Text style={styles.limitNote}>
              * Maximum 50% of order value can be redeemed
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    marginVertical: spacing.sm,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  loadingText: {
    ...typography.body2,
    color: Colors.gray600,
    marginLeft: spacing.sm,
  },
  noBalanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: scaleSize(8),
    marginVertical: spacing.sm,
  },
  noBalanceText: {
    ...typography.body2,
    color: Colors.gray600,
    marginLeft: spacing.sm,
    flex: 1,
  },

  // Available balance display
  availableContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: Colors.primary50,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.primary200,
  },
  disabled: {
    opacity: 0.6,
  },
  availableInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  balanceInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  availableTitle: {
    ...typography.body2,
    color: Colors.primary700,
    fontWeight: "600",
  },
  availableBalance: {
    ...typography.caption,
    color: Colors.primary600,
  },
  availableAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  useText: {
    ...typography.body2,
    color: Colors.primary600,
    fontWeight: "600",
    marginRight: spacing.xs,
  },
  minimumText: {
    ...typography.caption,
    color: Colors.gray600,
    marginRight: spacing.xs,
  },

  // Applied redemption display
  appliedContainer: {
    padding: spacing.md,
    backgroundColor: Colors.success50,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.success200,
  },
  appliedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  appliedInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  appliedTitle: {
    ...typography.body2,
    color: Colors.success700,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  appliedDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appliedAmount: {
    ...typography.body1,
    color: Colors.success700,
    fontWeight: "600",
  },
  appliedDiscount: {
    ...typography.body1,
    color: Colors.success600,
    fontWeight: "600",
  },

  // Redemption form
  redemptionForm: {
    padding: spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: scaleSize(8),
  },
  redemptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  redemptionTitle: {
    ...typography.heading4,
    color: Colors.gray900,
  },
  balanceLabel: {
    ...typography.body2,
    color: Colors.gray600,
  },
  balanceValue: {
    ...typography.body2,
    color: Colors.primary600,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: scaleSize(6),
    borderWidth: 1,
    borderColor: Colors.gray300,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  amountInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    ...typography.body1,
    color: Colors.gray900,
  },
  inputSuffix: {
    ...typography.body2,
    color: Colors.gray600,
  },
  conversionInfo: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  conversionText: {
    ...typography.body1,
    color: Colors.success600,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.md,
  },
  quickActionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: "white",
    borderRadius: scaleSize(4),
    borderWidth: 1,
    borderColor: Colors.primary300,
  },
  quickActionText: {
    ...typography.caption,
    color: Colors.primary600,
    fontWeight: "600",
  },
  redemptionActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: "white",
    borderRadius: scaleSize(6),
    borderWidth: 1,
    borderColor: Colors.gray300,
    alignItems: "center",
  },
  cancelButtonText: {
    ...typography.button,
    color: Colors.gray700,
  },
  applyButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
    backgroundColor: Colors.primary500,
    borderRadius: scaleSize(6),
    alignItems: "center",
  },
  applyButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  applyButtonText: {
    ...typography.button,
    color: "white",
  },
  applyButtonTextDisabled: {
    color: Colors.gray600,
  },
  limitNote: {
    ...typography.caption,
    color: Colors.gray600,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default BBMBucksRedemption;
