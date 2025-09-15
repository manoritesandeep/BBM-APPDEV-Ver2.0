import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import { typography, spacing, scaleSize } from "../../constants/responsive";
import { useReturns } from "../../store/returns-context";

function ReturnButton({
  order,
  onPress,
  style,
  variant = "primary", // "primary" | "outline" | "text"
}) {
  const { checkOrderReturnEligibility, returnEligibility, isLoading } =
    useReturns();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Check eligibility when component mounts
    if (order?.id && order?.status === "delivered") {
      checkEligibility();
    }
  }, [order?.id]);

  const checkEligibility = async () => {
    if (checking) return;

    setChecking(true);
    try {
      await checkOrderReturnEligibility(order.id);
    } catch (error) {
      console.error("Error checking return eligibility:", error);
    } finally {
      setChecking(false);
    }
  };

  // Don't show button if order is not delivered
  if (!order || order.status !== "delivered") {
    // Debug: Let's see what we have
    console.log("ReturnButton: Order status check", {
      hasOrder: !!order,
      status: order?.status,
      orderId: order?.id,
      orderNumber: order?.orderNumber,
    });
    return null;
  }

  // Show loading state while checking eligibility
  if (checking || isLoading) {
    return (
      <View style={[styles.button, styles.loadingButton, style]}>
        <ActivityIndicator size="small" color={Colors.gray500} />
        <Text style={styles.loadingText}>Checking eligibility...</Text>
      </View>
    );
  }

  // Don't show button if not eligible
  if (returnEligibility && !returnEligibility.eligible) {
    console.log("ReturnButton: Not eligible", {
      orderId: order?.id,
      eligibility: returnEligibility,
    });
    return null;
  }

  // Show eligible items count if available
  const eligibleItemsCount = returnEligibility?.eligibleItems?.length || 0;
  const buttonText =
    eligibleItemsCount > 0
      ? `Return Items (${eligibleItemsCount} eligible)`
      : "Return Items";

  const getButtonStyle = () => {
    switch (variant) {
      case "outline":
        return [styles.button, styles.outlineButton];
      case "text":
        return [styles.button, styles.textButton];
      default:
        return [styles.button, styles.primaryButton];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "outline":
        return styles.outlineButtonText;
      case "text":
        return styles.textButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        ...getButtonStyle(),
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name="return-down-back-outline"
        size={16}
        color={variant === "primary" ? Colors.white : Colors.primary600}
      />
      <Text style={getTextStyle()}>{buttonText}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: scaleSize(8),
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary600,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.primary600,
  },
  textButton: {
    backgroundColor: "transparent",
  },
  loadingButton: {
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    ...typography.body2,
    color: Colors.white,
    fontWeight: "600",
  },
  outlineButtonText: {
    ...typography.body2,
    color: Colors.primary600,
    fontWeight: "600",
  },
  textButtonText: {
    ...typography.body2,
    color: Colors.primary600,
    fontWeight: "500",
  },
  loadingText: {
    ...typography.body2,
    color: Colors.gray600,
  },
});

export default ReturnButton;
