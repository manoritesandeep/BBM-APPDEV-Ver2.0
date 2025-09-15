import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Button from "../UI/Button";
import { Colors } from "../../constants/styles";
import { PAYMENT_METHODS } from "../../util/paymentService";
import {
  spacing,
  scaleSize,
  deviceAdjustments,
  typography,
} from "../../constants/responsive";

function PlaceOrderFooter({
  total,
  onPlaceOrder,
  disabled = false,
  selectedPaymentMethod,
  showRazorpayPayment = false,
  onDirectPayment,
}) {
  const getButtonText = () => {
    if (selectedPaymentMethod === PAYMENT_METHODS.RAZORPAY) {
      return `Pay Now • ₹${total}`;
    }

    return `Place Order • ₹${total}`;
  };

  const handleButtonPress = () => {
    if (selectedPaymentMethod === PAYMENT_METHODS.RAZORPAY && onDirectPayment) {
      onDirectPayment();
    } else {
      onPlaceOrder();
    }
  };

  return (
    <View style={styles.footer}>
      <Button
        onPress={handleButtonPress}
        mode="filled"
        style={[styles.placeOrderButton, disabled && styles.disabledButton]}
        textStyle={styles.placeOrderButtonText}
        disabled={disabled}
      >
        {getButtonText()}
      </Button>
    </View>
  );
}

export default PlaceOrderFooter;

const styles = StyleSheet.create({
  footer: {
    backgroundColor: Colors.primary100,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  instructionText: {
    ...typography.caption,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  placeOrderButton: {
    paddingVertical: spacing.lg,
    borderRadius: scaleSize(25),
    ...deviceAdjustments.shadow,
    shadowColor: Colors.accent500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  placeOrderButtonText: {
    color: Colors.gray900,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
