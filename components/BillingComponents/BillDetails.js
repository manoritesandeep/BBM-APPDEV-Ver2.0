import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
  layout,
} from "../../constants/responsive";
import GstinSection from "./GstinSection";

function BillDetails({
  subtotal,
  tax,
  shipping,
  total,
  discount = 0,
  shippingSavings = 0,
  bbmBucksDiscount = 0,
  onGstinChange,
}) {
  const [gstinNumber, setGstinNumber] = useState(null);

  const handleGstinChange = (gstin) => {
    setGstinNumber(gstin);
    if (onGstinChange) {
      onGstinChange(gstin);
    }
  };
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bill Details</Text>
      <View style={styles.card}>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Subtotal</Text>
          <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Tax (18%)</Text>
          <Text style={styles.billValue}>₹{tax}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Shipping & Handling</Text>
          <Text
            style={[
              styles.billValue,
              shippingSavings > 0 && styles.freeShipping,
            ]}
          >
            {shippingSavings > 0 ? "FREE" : `₹${shipping}`}
          </Text>
        </View>
        {discount > 0 && (
          <View style={styles.billRow}>
            <Text style={styles.discountLabel}>Coupon Discount</Text>
            <Text style={styles.discountValue}>-₹{discount.toFixed(2)}</Text>
          </View>
        )}
        {bbmBucksDiscount > 0 && (
          <View style={styles.billRow}>
            <Text style={styles.discountLabel}>BBM Bucks Discount</Text>
            <Text style={styles.discountValue}>
              -₹{bbmBucksDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        {shippingSavings > 0 && (
          <View style={styles.billRow}>
            <Text style={styles.discountLabel}>Shipping Savings</Text>
            <Text style={styles.discountValue}>
              -₹{shippingSavings.toFixed(2)}
            </Text>
          </View>
        )}
        <View style={styles.divider} />
        <View style={styles.billRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>
      </View>

      {/* GSTIN Section */}
      <GstinSection onGstinChange={handleGstinChange} />
    </View>
  );
}

export default BillDetails;

const styles = StyleSheet.create({
  section: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.subheading,
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  billRow: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  billLabel: {
    ...typography.body,
    color: Colors.gray700,
  },
  billValue: {
    ...typography.body,
    fontWeight: "500",
    color: Colors.gray900,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    ...typography.subheading,
    fontWeight: "600",
    color: Colors.gray900,
  },
  totalValue: {
    ...typography.subheading,
    fontWeight: "700",
    color: Colors.accent700,
  },
  discountLabel: {
    ...typography.body,
    color: Colors.success,
    fontWeight: "500",
  },
  discountValue: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.success,
  },
  freeShipping: {
    color: Colors.success,
    fontWeight: "600",
  },
});
