import React from "react";
import { View, Text, StyleSheet, TextInput, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../../constants/responsive";

const RETURN_REASON_LABELS = {
  defective: "Defective Item",
  wrong_item: "Wrong Item",
  damaged_shipping: "Damaged in Shipping",
  size_issue: "Size Issue",
  color_mismatch: "Color Mismatch",
  quality_issue: "Quality Issue",
  not_as_described: "Not as Described",
  changed_mind: "Changed Mind",
  other: "Other",
};

function ReviewStep({
  order,
  selectedItems,
  returnReason,
  customReason,
  selectedRefundMethod,
  customerNotes,
  onNotesChange,
  refundCalculation,
  getAvailableRefundMethods,
  getBBMBucksIncentive,
}) {
  const selectedRefundMethodData = getAvailableRefundMethods().find(
    (method) => method.id === selectedRefundMethod
  );

  const bbmBucksDetails =
    selectedRefundMethod === "bbm_bucks" && refundCalculation?.totalRefund
      ? getBBMBucksIncentive(refundCalculation.totalRefund)
      : null;

  const totalQuantity = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Review Your Return Request</Text>
      <Text style={styles.stepDescription}>
        Please review all details before submitting your return request.
      </Text>

      {/* Order Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.card}>
          <Text style={styles.orderNumber}>Order: {order.orderNumber}</Text>
          <Text style={styles.orderDate}>
            Placed:{" "}
            {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Items to Return */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Items to Return ({selectedItems.length} item
          {selectedItems.length > 1 ? "s" : ""}, {totalQuantity} unit
          {totalQuantity > 1 ? "s" : ""})
        </Text>
        <View style={styles.card}>
          {selectedItems.map((item, index) => (
            <View
              key={item.itemId}
              style={[styles.itemRow, index > 0 && styles.itemRowBorder]}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.productName}
                </Text>
                <View style={styles.itemSpecs}>
                  {item.size && (
                    <Text style={styles.specText}>Size: {item.size}</Text>
                  )}
                  {item.color && (
                    <Text style={styles.specText}>Color: {item.color}</Text>
                  )}
                </View>
                <Text style={styles.itemPrice}>
                  ₹{item.price} × {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Return Reason */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Return Reason</Text>
        <View style={styles.card}>
          <Text style={styles.reasonLabel}>
            {RETURN_REASON_LABELS[returnReason] || returnReason}
          </Text>
          {returnReason === "other" && customReason && (
            <Text style={styles.customReasonText}>{customReason}</Text>
          )}
        </View>
      </View>

      {/* Refund Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Refund Method</Text>
        <View style={styles.card}>
          <View style={styles.refundMethodHeader}>
            <Ionicons
              name={selectedRefundMethodData?.icon || "card-outline"}
              size={20}
              color={Colors.primary500}
            />
            <Text style={styles.refundMethodLabel}>
              {selectedRefundMethodData?.label || selectedRefundMethod}
            </Text>
          </View>

          <Text style={styles.refundMethodDescription}>
            {selectedRefundMethodData?.description}
          </Text>

          {bbmBucksDetails && (
            <View style={styles.bbmBucksBreakdown}>
              <View style={styles.bbmBucksRow}>
                <Text style={styles.bbmBucksLabel}>Base Amount:</Text>
                <Text style={styles.bbmBucksValue}>
                  ₹{bbmBucksDetails.baseAmount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.bbmBucksRow}>
                <Text style={styles.bbmBucksLabel}>Bonus (1%):</Text>
                <Text style={styles.bbmBucksBonusValue}>
                  +₹{bbmBucksDetails.bonusAmount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.bbmBucksDivider} />
              <View style={styles.bbmBucksRow}>
                <Text style={styles.bbmBucksTotalLabel}>Total BBM Bucks:</Text>
                <Text style={styles.bbmBucksTotalValue}>
                  ₹{bbmBucksDetails.totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Refund Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Refund Summary</Text>
        <View style={styles.card}>
          {refundCalculation && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ₹
                  {refundCalculation.breakdown.itemsSubtotal?.toFixed(2) ||
                    "0.00"}
                </Text>
              </View>

              {refundCalculation.breakdown.couponDiscount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Coupon Discount (prorated)
                  </Text>
                  <Text style={styles.summaryNegativeValue}>
                    -₹{refundCalculation.breakdown.couponDiscount.toFixed(2)}
                  </Text>
                </View>
              )}

              {refundCalculation.breakdown.bbmBucksDiscount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    BBM Bucks Used (prorated)
                  </Text>
                  <Text style={styles.summaryNegativeValue}>
                    -₹{refundCalculation.breakdown.bbmBucksDiscount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>
                  {selectedRefundMethod === "bbm_bucks"
                    ? "Refund Amount"
                    : "Total Refund"}
                </Text>
                <Text style={styles.summaryTotalValue}>
                  ₹{refundCalculation.totalRefund.toFixed(2)}
                </Text>
              </View>

              {bbmBucksDetails && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryBonusLabel}>
                    You'll Receive (with bonus)
                  </Text>
                  <Text style={styles.summaryBonusValue}>
                    ₹{bbmBucksDetails.totalAmount.toFixed(2)} BBM Bucks
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {/* Additional Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          value={customerNotes}
          onChangeText={onNotesChange}
          placeholder="Any additional information about your return..."
          placeholderTextColor={Colors.gray400}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Important Information */}
      <View style={styles.importantInfo}>
        <Ionicons
          name="information-circle"
          size={20}
          color={Colors.orange500}
        />
        <View style={styles.importantText}>
          <Text style={styles.importantTitle}>Important Information</Text>
          <Text style={styles.importantDescription}>
            • Returns are processed within 3-5 business days{"\n"}• Items must
            be returned within 10 days of this request{"\n"}• Items should be in
            original condition and packaging{"\n"}• You'll receive email updates
            on your return status
          </Text>
        </View>
      </View>
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    padding: spacing.lg,
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderNumber: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.xs,
  },
  orderDate: {
    ...typography.body2,
    color: Colors.gray600,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.body2,
    fontWeight: "500",
    color: Colors.gray900,
    marginBottom: spacing.xs,
  },
  itemSpecs: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  specText: {
    ...typography.caption,
    color: Colors.gray600,
  },
  itemPrice: {
    ...typography.caption,
    color: Colors.gray700,
  },
  itemTotal: {
    ...typography.body2,
    fontWeight: "600",
    color: Colors.gray900,
    marginLeft: spacing.md,
  },
  reasonLabel: {
    ...typography.body2,
    fontWeight: "500",
    color: Colors.gray900,
  },
  customReasonText: {
    ...typography.body2,
    color: Colors.gray700,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  refundMethodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  refundMethodLabel: {
    ...typography.body2,
    fontWeight: "600",
    color: Colors.gray900,
    marginLeft: spacing.sm,
  },
  refundMethodDescription: {
    ...typography.body2,
    color: Colors.gray600,
  },
  bbmBucksBreakdown: {
    backgroundColor: Colors.success50,
    padding: spacing.md,
    borderRadius: scaleSize(8),
    marginTop: spacing.sm,
  },
  bbmBucksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  bbmBucksLabel: {
    ...typography.caption,
    color: Colors.success800,
  },
  bbmBucksValue: {
    ...typography.caption,
    color: Colors.success800,
    fontWeight: "500",
  },
  bbmBucksBonusValue: {
    ...typography.caption,
    color: Colors.success700,
    fontWeight: "600",
  },
  bbmBucksDivider: {
    height: 1,
    backgroundColor: Colors.success300,
    marginVertical: spacing.xs,
  },
  bbmBucksTotalLabel: {
    ...typography.body2,
    color: Colors.success900,
    fontWeight: "600",
  },
  bbmBucksTotalValue: {
    ...typography.body2,
    color: Colors.success900,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body2,
    color: Colors.gray600,
  },
  summaryValue: {
    ...typography.body2,
    color: Colors.gray900,
    fontWeight: "500",
  },
  summaryNegativeValue: {
    ...typography.body2,
    color: Colors.orange600,
    fontWeight: "500",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: spacing.sm,
  },
  summaryTotalLabel: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
  },
  summaryTotalValue: {
    ...typography.body,
    fontWeight: "700",
    color: Colors.success600,
  },
  summaryBonusLabel: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.success800,
  },
  summaryBonusValue: {
    ...typography.body,
    fontWeight: "700",
    color: Colors.success700,
  },
  notesInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: scaleSize(8),
    padding: spacing.md,
    ...typography.body2,
    color: Colors.gray900,
    minHeight: scaleSize(80),
  },
  importantInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.orange50,
    padding: spacing.md,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.orange200,
  },
  importantText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  importantTitle: {
    ...typography.body2,
    fontWeight: "600",
    color: Colors.orange800,
    marginBottom: spacing.xs,
  },
  importantDescription: {
    ...typography.caption,
    color: Colors.orange700,
    lineHeight: scaleSize(16),
  },
});

export default ReviewStep;
