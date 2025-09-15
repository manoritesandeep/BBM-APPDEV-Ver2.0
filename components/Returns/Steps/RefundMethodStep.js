import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../../constants/responsive";

function RefundMethodStep({
  selectedMethod,
  onMethodChange,
  availableMethods,
  refundCalculation,
  getBBMBucksIncentive,
  error,
}) {
  const getBBMBucksDetails = () => {
    if (!refundCalculation?.totalRefund) return null;
    return getBBMBucksIncentive(refundCalculation.totalRefund);
  };

  const bbmBucksDetails = getBBMBucksDetails();

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Choose Refund Method</Text>
      <Text style={styles.stepDescription}>
        Select how you'd like to receive your refund of ₹
        {refundCalculation?.totalRefund?.toFixed(2) || "0.00"}
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={Colors.error500} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Refund breakdown */}
      {refundCalculation && (
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Refund Breakdown</Text>

          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Items Subtotal</Text>
            <Text style={styles.breakdownValue}>
              ₹{refundCalculation.breakdown.itemsSubtotal?.toFixed(2) || "0.00"}
            </Text>
          </View>

          {refundCalculation.breakdown.couponDiscount > 0 && (
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>
                Coupon Discount (prorated)
              </Text>
              <Text style={styles.breakdownNegativeValue}>
                -₹{refundCalculation.breakdown.couponDiscount.toFixed(2)}
              </Text>
            </View>
          )}

          {refundCalculation.breakdown.bbmBucksDiscount > 0 && (
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>
                BBM Bucks Used (prorated)
              </Text>
              <Text style={styles.breakdownNegativeValue}>
                -₹{refundCalculation.breakdown.bbmBucksDiscount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.breakdownDivider} />

          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownTotalLabel}>Total Refund</Text>
            <Text style={styles.breakdownTotalValue}>
              ₹{refundCalculation.totalRefund.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {/* Refund method options */}
      <View style={styles.methodsList}>
        {availableMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isBBMBucks = method.id === "bbm_bucks";

          return (
            <Pressable
              key={method.id}
              style={[
                styles.methodOption,
                isSelected && styles.selectedMethod,
                method.highlighted && styles.highlightedMethod,
              ]}
              onPress={() => onMethodChange(method.id)}
            >
              <View style={styles.methodContent}>
                <View style={styles.methodIcon}>
                  <Ionicons
                    name={method.icon}
                    size={24}
                    color={
                      method.highlighted
                        ? Colors.success600
                        : isSelected
                        ? Colors.primary500
                        : Colors.gray600
                    }
                  />
                </View>

                <View style={styles.methodText}>
                  <View style={styles.methodHeader}>
                    <Text
                      style={[
                        styles.methodLabel,
                        isSelected && styles.selectedMethodLabel,
                      ]}
                    >
                      {method.label}
                    </Text>
                    {method.highlighted && (
                      <View style={styles.highlightBadge}>
                        <Text style={styles.highlightText}>BONUS</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.methodDescription}>
                    {method.description}
                  </Text>

                  {/* BBM Bucks incentive details */}
                  {isBBMBucks && bbmBucksDetails && (
                    <View style={styles.incentiveContainer}>
                      <View style={styles.incentiveItem}>
                        <Text style={styles.incentiveLabel}>Base Amount:</Text>
                        <Text style={styles.incentiveValue}>
                          ₹{bbmBucksDetails.baseAmount.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.incentiveItem}>
                        <Text style={styles.incentiveLabel}>Bonus (1%):</Text>
                        <Text style={styles.bonusValue}>
                          +₹{bbmBucksDetails.bonusAmount.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.incentiveDivider} />
                      <View style={styles.incentiveItem}>
                        <Text style={styles.incentiveTotalLabel}>
                          Total BBM Bucks:
                        </Text>
                        <Text style={styles.incentiveTotalValue}>
                          ₹{bbmBucksDetails.totalAmount.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.radioContainer}>
                  <View
                    style={[styles.radio, isSelected && styles.selectedRadio]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Processing time info */}
      <View style={styles.processingInfo}>
        <Ionicons name="time-outline" size={20} color={Colors.blue500} />
        <View style={styles.processingText}>
          <Text style={styles.processingTitle}>Processing Time</Text>
          <Text style={styles.processingDescription}>
            Returns are processed within 3-5 business days once we receive and
            inspect the items. You have up to 10 days from the return request to
            send the items back to us.
          </Text>
        </View>
      </View>

      {/* BBM Bucks info */}
      {selectedMethod === "bbm_bucks" && (
        <View style={styles.bbmBucksInfo}>
          <Ionicons name="gift-outline" size={20} color={Colors.success600} />
          <View style={styles.bbmBucksText}>
            <Text style={styles.bbmBucksTitle}>About BBM Bucks</Text>
            <Text style={styles.bbmBucksDescription}>
              BBM Bucks can be used for future purchases and never expire.
              You'll get an instant 1% bonus for choosing this option!
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepTitle: {
    ...typography.heading3,
    color: Colors.gray900,
    marginBottom: spacing.sm,
  },
  stepDescription: {
    ...typography.body,
    color: Colors.gray600,
    marginBottom: spacing.lg,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.error50,
    padding: spacing.md,
    borderRadius: scaleSize(8),
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body2,
    color: Colors.error700,
    marginLeft: spacing.sm,
    flex: 1,
  },
  breakdownContainer: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  breakdownTitle: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.md,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  breakdownLabel: {
    ...typography.body2,
    color: Colors.gray600,
  },
  breakdownValue: {
    ...typography.body2,
    color: Colors.gray900,
    fontWeight: "500",
  },
  breakdownNegativeValue: {
    ...typography.body2,
    color: Colors.orange600,
    fontWeight: "500",
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: spacing.sm,
  },
  breakdownTotalLabel: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
  },
  breakdownTotalValue: {
    ...typography.body,
    fontWeight: "700",
    color: Colors.success600,
  },
  methodsList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  methodOption: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedMethod: {
    borderColor: Colors.primary500,
    borderWidth: 2,
    backgroundColor: Colors.primary25,
  },
  highlightedMethod: {
    borderColor: Colors.success500,
    backgroundColor: Colors.success25,
  },
  methodContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.lg,
  },
  methodIcon: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  methodText: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  methodLabel: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
  },
  selectedMethodLabel: {
    color: Colors.primary700,
  },
  highlightBadge: {
    backgroundColor: Colors.success600,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: scaleSize(4),
    marginLeft: spacing.sm,
  },
  highlightText: {
    ...typography.caption,
    color: Colors.white,
    fontWeight: "700",
    fontSize: scaleSize(10),
  },
  methodDescription: {
    ...typography.body2,
    color: Colors.gray600,
    marginBottom: spacing.sm,
  },
  incentiveContainer: {
    backgroundColor: Colors.success50,
    padding: spacing.md,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.success200,
  },
  incentiveItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  incentiveLabel: {
    ...typography.caption,
    color: Colors.success800,
  },
  incentiveValue: {
    ...typography.caption,
    color: Colors.success800,
    fontWeight: "500",
  },
  bonusValue: {
    ...typography.caption,
    color: Colors.success700,
    fontWeight: "600",
  },
  incentiveDivider: {
    height: 1,
    backgroundColor: Colors.success300,
    marginVertical: spacing.xs,
  },
  incentiveTotalLabel: {
    ...typography.body2,
    color: Colors.success900,
    fontWeight: "600",
  },
  incentiveTotalValue: {
    ...typography.body2,
    color: Colors.success900,
    fontWeight: "700",
  },
  radioContainer: {
    marginLeft: spacing.md,
    marginTop: spacing.xs,
  },
  radio: {
    width: scaleSize(20),
    height: scaleSize(20),
    borderRadius: scaleSize(10),
    borderWidth: 2,
    borderColor: Colors.gray300,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedRadio: {
    borderColor: Colors.primary500,
  },
  radioInner: {
    width: scaleSize(10),
    height: scaleSize(10),
    borderRadius: scaleSize(5),
    backgroundColor: Colors.primary500,
  },
  processingInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.blue50,
    padding: spacing.md,
    borderRadius: scaleSize(8),
    marginBottom: spacing.md,
  },
  processingText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  processingTitle: {
    ...typography.body2,
    fontWeight: "600",
    color: Colors.blue800,
    marginBottom: spacing.xs,
  },
  processingDescription: {
    ...typography.caption,
    color: Colors.blue700,
  },
  bbmBucksInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.success50,
    padding: spacing.md,
    borderRadius: scaleSize(8),
  },
  bbmBucksText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  bbmBucksTitle: {
    ...typography.body2,
    fontWeight: "600",
    color: Colors.success800,
    marginBottom: spacing.xs,
  },
  bbmBucksDescription: {
    ...typography.caption,
    color: Colors.success700,
  },
});

export default RefundMethodStep;
