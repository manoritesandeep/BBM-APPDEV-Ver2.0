import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
  layout,
  iconSizes,
} from "../../constants/responsive";
import Button from "../UI/Button";

function CouponSection({
  appliedCoupon,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
  isValidating,
  error,
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Apply Coupon</Text>
      <View style={styles.card}>
        {appliedCoupon ? (
          // Applied coupon display
          <View style={styles.appliedCouponContainer}>
            <View style={styles.appliedCouponInfo}>
              <Ionicons
                name="checkmark-circle"
                size={iconSizes.sm}
                color={Colors.success}
              />
              <View style={styles.appliedCouponText}>
                <Text style={styles.appliedCouponCode}>
                  {appliedCoupon.code}
                </Text>
                <Text style={styles.appliedCouponDescription}>
                  {appliedCoupon.title}
                </Text>
                <Text style={styles.discountAmount}>
                  You saved ₹
                  {appliedCoupon.discountAmount?.toFixed(2) || "0.00"}
                </Text>
              </View>
            </View>
            <Pressable onPress={onRemoveCoupon} style={styles.removeButton}>
              <Ionicons name="close" size={iconSizes.sm} color={Colors.error} />
            </Pressable>
          </View>
        ) : (
          // Coupon input
          <View>
            <View style={styles.couponInputContainer}>
              <TextInput
                style={[styles.couponInput, error && styles.couponInputError]}
                placeholder="Enter coupon code"
                value={couponCode}
                onChangeText={onCouponCodeChange}
                autoCapitalize="characters"
                editable={!isValidating}
              />
              <Button
                onPress={onApplyCoupon}
                mode="outlined"
                style={styles.applyButton}
                textStyle={styles.applyButtonText}
                disabled={!couponCode.trim() || isValidating}
              >
                {isValidating ? (
                  <ActivityIndicator size="small" color={Colors.accent700} />
                ) : (
                  "Apply"
                )}
              </Button>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

export default CouponSection;

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
  couponInputContainer: {
    ...layout.flexRow,
    alignItems: "center",
    gap: spacing.sm,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: scaleSize(8),
    padding: spacing.md,
    ...typography.body,
    backgroundColor: Colors.white,
  },
  couponInputError: {
    borderColor: Colors.error,
  },
  applyButton: {
    paddingHorizontal: spacing.lg,
    minWidth: scaleSize(80),
  },
  applyButtonText: {
    ...typography.bodySmall,
    fontWeight: "600",
  },
  appliedCouponContainer: {
    ...layout.flexRow,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  appliedCouponInfo: {
    ...layout.flexRow,
    alignItems: "flex-start",
    flex: 1,
    gap: spacing.sm,
  },
  appliedCouponText: {
    flex: 1,
  },
  appliedCouponCode: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.success,
    marginBottom: spacing.xs / 2,
  },
  appliedCouponDescription: {
    ...typography.bodySmall,
    color: Colors.gray700,
    marginBottom: spacing.xs / 2,
  },
  discountAmount: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: Colors.success,
  },
  removeButton: {
    padding: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: Colors.error,
    marginTop: spacing.sm,
  },
});
